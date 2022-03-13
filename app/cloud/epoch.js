async function getEpochCountByTeamId(teamId) {
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("teamId", teamId);
  return await epochQuery.count();
}

async function getEpochParseObjByObjectId(objectId) {
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("objectId", objectId);
  return await epochQuery.first();
}

async function getEpochsBySpaceId(spaceId, callerId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { spaceId: spaceId } }];
  var epochs = await epochQuery.aggregate(pipeline);
  for (var epoch of epochs) {
    if (callerId in epoch.memberStats) {
      epoch.votesGivenByCaller = epoch.memberStats[callerId].votesGiven;
      epoch.votesAllocated = epoch.memberStats[callerId].votesAllocated;
      epoch.votesRemaining = epoch.memberStats[callerId].votesRemaining;
    }
  }
  return epochs.reverse();
}

async function getEpochByObjectId(objectId, callerId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { objectId: objectId } }];
  const epoch = await epochQuery.aggregate(pipeline);
  if (callerId in epoch[0].memberStats) {
    epoch[0].votesGivenByCaller = epoch[0].memberStats[callerId].votesGiven;
    epoch[0].votesAllocated = epoch[0].memberStats[callerId].votesAllocated;
    epoch[0].votesRemaining = epoch[0].memberStats[callerId].votesRemaining;
  }
  if (epoch.length > 0) {
    return epoch[0];
  } else {
    logger.info("No epochs with given object id");
    return false;
  }
}

function initializeEpochMembers(members, choices) {
  var epochMembers = {};
  var memberIdsToVotesGiven = {};

  for (var choice of choices) {
    memberIdsToVotesGiven[choice] = 0;
  }
  for (var member of members) {
    logger.info(`member ${JSON.stringify(member)}`);

    epochMembers[member.objectId] = {
      objectId: member.objectId,
      votesGiven: memberIdsToVotesGiven,
      votesRemaining: member.votesAllocated,
      votesAllocated: member.votesAllocated,
    };
  }
  logger.info(`epochMembers ${JSON.stringify(members)}`);
  return epochMembers;
}

Moralis.Cloud.define("startEpoch", async (request) => {
  try {
    if (request.params.members.length === 0)
      throw "Cant create epoch with no members";
    const endTime =
      parseInt(request.params.startTime) + parseInt(request.params.duration);
    const epochCount = await getEpochCountByTeamId(request.params.teamId);
    const initMembersStats = initializeEpochMembers(
      request.params.members,
      request.params.choices
    );

    var epoch = new Moralis.Object("Epoch");
    epoch.set("teamId", request.params.teamId);
    epoch.set("name", request.params.name);
    epoch.set("choices", request.params.choices);
    epoch.set("spaceId", request.params.spaceId);
    epoch.set("startTime", new Date(parseInt(request.params.startTime)));
    epoch.set("duration", parseInt(request.params.duration)); // in milliseconds
    epoch.set("endTime", new Date(endTime));
    epoch.set("memberStats", initMembersStats); // list
    epoch.set("type", request.params.type);
    epoch.set("strategy", request.params.strategy);
    epoch.set("budget", parseInt(request.params.budget));
    epoch.set("token", request.params.token);
    epoch.set("chain", request.params.chain);
    epoch.set("epochNumber", epochCount + 1);
    epoch.set("active", true);
    epoch.set("paid", false);
    epoch.set("nativeCurrencyPayment", request.params.nativeCurrencyPayment);

    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while starting epoch with name ${request.params.name}: ${err}`
    );
    throw `Error while starting epoch: ${err}`;
  }
});

function calculateQuadraticVotes(memberStats) {
  var totalVotes = 0;
  var votes = {};

  for (var memberId of Object.keys(memberStats)) {
    for (var choice of Object.keys(memberStats[memberId].votesGiven)) {
      if (!(choice in votes)) {
        votes[choice] = 0;
      }
      votes[choice] += memberStats[memberId].votesGiven[choice];
      totalVotes += memberStats[memberId].votesGiven[choice];
    }
  }

  return [totalVotes, votes];
}

function calculatePassNoPassVotes(memberStats) {
  var votesFor = {};
  var votesAgainst = {};

  for (var memberId of Object.keys(memberStats)) {
    for (var choice of Object.keys(memberStats[memberId].votesGiven)) {
      if (!(choice in votesFor)) {
        votesFor[choice] = 0;
      }
      if (!(choice in votesAgainst)) {
        votesAgainst[choice] = 0;
      }
      logger.info(`votesFor ${JSON.stringify(votesFor)}`);
      logger.info(`votesAgainst ${JSON.stringify(votesAgainst)}`);

      if (memberStats[memberId].votesGiven[choice] === -1) {
        votesAgainst[choice] += 1;
      } else if (memberStats[memberId].votesGiven[choice] === 1) {
        votesFor[choice] += 1;
      }
    }
  }

  return [votesFor, votesAgainst];
}

Moralis.Cloud.define("endEpoch", async (request) => {
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set("active", false);
    var votes = {};
    var values = {};
    const memberStats = epoch.get("memberStats");
    if (epoch.get("strategy") === "Quadratic voting") {
      var [totalVotes, votes] = calculateQuadraticVotes(memberStats);
      epoch.set("votes", votes);
      if (epoch.get("budget") && epoch.get("budget") > 0) {
        for (var choice of epoch.get("choices")) {
          values[choice] = (votes[choice] * epoch.get("budget")) / totalVotes;
        }
        epoch.set("values", values);
      }
    } else if (epoch.get("strategy") === "Pass/No Pass") {
      var [votesFor, votesAgainst] = calculatePassNoPassVotes(memberStats);
      epoch.set("votesFor", votesFor);
      epoch.set("votesAgainst", votesAgainst);
    }
    logger.info(`epochhhh ${JSON.stringify(epoch)}`);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochByObjectId(request.params.epochId, request.user.id);
  } catch (err) {
    logger.error(`Error while ending epoch ${request.params.epochId}: ${err}`);
    throw `Error while ending epoch ${request.params.epochId}: ${err}`;
  }
});

async function getEpochs(spaceId, userId) {
  try {
    const epochs = await getEpochsBySpaceId(spaceId, userId);

    var taskIds = [];
    for (var epoch of epochs) {
      if (epoch.type === "Card") {
        logger.info(`choices ${JSON.stringify(epoch.choices)}`);

        taskIds = taskIds.concat(epoch.choices);
      }
    }
    logger.info(`taskIds ${JSON.stringify(taskIds)}`);

    const taskDetails = await getTaskObjsByTaskIds(taskIds);
    logger.info(`taskDetails ${JSON.stringify(taskDetails)}`);

    var mappedTaskDetails = {};
    for (var task of taskDetails) {
      mappedTaskDetails[task.taskId] = task;
    }
    logger.info(`mappedTaskDetails ${JSON.stringify(mappedTaskDetails)}`);
    return { epochs: epochs, taskDetails: mappedTaskDetails };
  } catch (err) {
    logger.error(`Error while getting epochs for space ${spaceId}: ${err}`);
    throw `Error while getting epochs ${err}`;
  }
}

Moralis.Cloud.define("getEpochs", async (request) => {
  return await getEpochs(request.params.spaceId, request.user.id);
});

function getTotalVotesGiven(votesGiven, strategy) {
  var totalVotes = 0;
  if (strategy === "Quadratic voting") {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId] ** 2;
    }
  } else if (strategy === "Pass/No Pass") {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId];
    }
  }

  return totalVotes;
}

Moralis.Cloud.define("saveVotes", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    var totalVotesGiven = getTotalVotesGiven(
      request.params.votesGiven,
      epoch.get("strategy")
    );
    logger.info(`totalVotesGivens ${JSON.stringify(totalVotesGiven)}`);
    var memberStats = epoch.get("memberStats");
    if (
      request.user.id in memberStats &&
      totalVotesGiven <= memberStats[request.user.id].votesAllocated
    ) {
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesGiven = request.params.votesGiven;
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesRemaining =
        memberStats[request.user.id].votesAllocated - totalVotesGiven;
    } else throw "Votes given overshoots votes allocated";

    epoch.set("memberStats", memberStats);
    logger.info(`Saving votes ${JSON.stringify(epoch)}`);

    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return epoch;
  } catch (err) {
    logger.error(
      `Error while saving votes for epoch ${request.params.epochId}: ${err}`
    );
    throw `Error while saving votes ${err}`;
  }
});

Moralis.Cloud.define("completeEpochPayment", async (request) => {
  try {
    const epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set("paid", true);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while completing epoch payment for epoch ${request.params.epochId}: ${err}`
    );
    throw `Error while completing epoch payment ${err}`;
  }
});

async function activateEpoch() {}
async function deactivateEpoch() {}
