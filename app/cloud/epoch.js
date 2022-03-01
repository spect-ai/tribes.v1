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
  return epochs;
}

async function getEpochByObjectId(objectId, callerId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { objectId: objectId } }];
  const epoch = await epochQuery.aggregate(pipeline);
  if (epoch.length > 0) {
    return epoch[0];
  } else {
    logger.info("No epochs with given object id");
    return false;
  }
}

async function getEpochsAdminViewBySpaceId(spaceId, callerId) {
  const epochs = await getEpochsBySpaceId(spaceId, callerId);

  return epochs;
}

async function getEpochNonAdminViewByObjectId(spaceId, callerId) {
  const epoch = await getEpochsBySpaceId(spaceId, callerId);

  return epoch;
}

function initializeEpochMembers(members, choices) {
  var epochMembers = {};
  var memberIdsToVotesGiven = {};

  for (var choice of choices) {
    memberIdsToVotesGiven[choice] = 0;
  }
  for (var member of members) {
    epochMembers[member.userId] = {
      objectId: member.userId,
      votesGiven: memberIdsToVotesGiven,
      votesRemaining: member.allocation,
      votesAllocated: member.allocation,
    };
  }
  logger.info(`epochMembers ${JSON.stringify(members)}`);
  return epochMembers;
}

Moralis.Cloud.define("startEpoch", async (request) => {
  try {
    const endTime =
      parseInt(request.params.startTime) + parseInt(request.params.duration);
    const epochCount = await getEpochCountByTeamId(request.params.teamId);
    const initMembersStats = initializeEpochMembers(
      request.params.members,
      request.params.choices
    );

    var epoch = new Moralis.Object("Epoch");
    epoch.set("teamId", parseInt(request.params.teamId));
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
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochsBySpaceId(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(`Error while starting epoch ${err}`);
    throw `${err}`;
  }
});

Moralis.Cloud.define("endEpoch", async (request) => {
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set("active", false);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochsBySpaceId(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(`Error while creating board ${err}`);
    throw `${err}`;
  }
});

Moralis.Cloud.define("getEpochs", async (request) => {
  try {
    return await getEpochsBySpaceId(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(`Error while getting epochs ${err}`);
    throw `${err}`;
  }
});

function getTotalVotesGiven(votesGiven) {
  var totalVotes = 0;
  for (var objectId of Object.keys(votesGiven)) {
    totalVotes += votesGiven[objectId] ** 2;
  }
  return totalVotes;
}

Moralis.Cloud.define("saveVotes", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    var totalVotesGiven = getTotalVotesGiven(request.params.votesGiven);
    logger.info(`totalVotesGivens ${JSON.stringify(totalVotesGiven)}`);
    var memberStats = epoch.get("memberStats");
    if (
      request.user.id in memberStats &&
      totalVotesGiven < memberStats[request.user.id].votesAllocated
    ) {
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesGiven = request.params.votesGiven;
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesRemaining -= totalVotesGiven;
    } else throw "Votes given overshoots votes allocated";

    epoch.set("memberStats", memberStats);
    logger.info(`Saving votes ${JSON.stringify(epoch)}`);

    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return epoch;
  } catch (err) {
    logger.error(`Error while saving votes ${err}`);
    throw `Error while saving votes ${err}`;
  }
});

async function activateEpoch() {}
async function deactivateEpoch() {}
