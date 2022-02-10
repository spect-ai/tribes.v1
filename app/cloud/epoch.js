function getInitialVoteAllocatedObj(members) {
  var votesAllocatedObj = {};
  for (var memberAddress of members) {
    votesAllocatedObj[memberAddress] = 0;
  }
  return votesAllocatedObj;
}

function initializeEpochMembers(members, from_team = false, task_epoch = false) {
  const votesAllocatedObj = task_epoch ? {} : getInitialVoteAllocatedObj(members);
  var epochMembers = [];
  for (var member of members) {
    var memberAddress = from_team ? member.ethAddress : member;
    epochMembers.push({
      ethAddress: memberAddress,
      votesGiven: 0,
      votesReceived: 0,
      votesRemaining: 100,
      votesAllocated: votesAllocatedObj,
      reward: 0,
    });
  }
  logger.info(`members ${JSON.stringify(members)}`);
  return epochMembers;
}

async function getEpochCountByTeamId(teamId) {
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("teamId", teamId);
  return await epochQuery.count();
}

async function getEpochByObjectId(objectId) {
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("objectId", objectId);
  return await epochQuery.first();
}

async function getEpochObjByObjectId(objectId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { objectId: objectId } }];
  return await epochQuery.aggregate(pipeline);
}

async function getNewEpoch(epoch, teamId, startTime, duration, epochMembers, type, strategy, budget) {
  const endTime = parseInt(startTime) + parseInt(duration);
  const epochCount = await getEpochCountByTeamId(teamId);
  epoch.set("teamId", parseInt(teamId));
  epoch.set("startTime", new Date(parseInt(startTime)));
  epoch.set("duration", parseInt(duration)); // in milliseconds
  epoch.set("endTime", new Date(endTime));
  epoch.set("memberStats", epochMembers); // list
  epoch.set("type", type);
  epoch.set("strategy", strategy);
  epoch.set("budget", parseInt(budget));
  epoch.set("epochNumber", epochCount + 1);
  epoch.set("active", true);
  return epoch;
}

Moralis.Cloud.define("startEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    logger.info(`id ${JSON.stringify(request.params.teamId)}`);

    var team = await getTribeByTeamId(request.params.teamId);
    logger.info(`tea ${JSON.stringify(team)}`);

    const canStart = await hasAccess(request.user.get("ethAddress"), team, (requiredAccess = "admin"));
    if (canStart) {
      logger.info(`canStart ${canStart}`);

      var epochMembers;

      // Initialize epoch with custom members
      if (request.params.members) {
        epochMembers = initializeEpochMembers(
          request.params.members,
          (from_team = false),
          (task_epoch = request.params.type === "Task")
        );
      }
      // Initialize epoch from team members
      else {
        epochMembers = initializeEpochMembers(
          team.get("members"),
          (from_team = true),
          (task_epoch = request.params.type === "Task")
        );
      }
      logger.info(`dfzfvfv`);
      // Start new epoch
      var epoch = new Moralis.Object("Epoch");
      epoch = await getNewEpoch(
        epoch,
        request.params.teamId,
        request.params.startTime,
        request.params.duration,
        epochMembers,
        request.params.type,
        request.params.strategy,
        request.params.budget
      );
      logger.info(`Creating epoch ${JSON.stringify(epoch)}`);
      await Moralis.Object.saveAll([epoch], { useMasterKey: true });

      // Update team with latest epoch
      logger.info(`Getting team with latest epoch id ${epoch.id}`);
      team = await getLatestEpochForTribe(team, epoch.id, request.params.type === "Task");
      logger.info(`Updating team ${JSON.stringify(team)} with latest epoch id ${epoch.id}`);
      await Moralis.Object.saveAll([team], { useMasterKey: true });
      logger.info(`Savinf team with latest epoch id ${epoch.id}`);

      return epoch;
    } else {
      logger.info(`User doesnt have access to start epoch`);
      throw "User doesnt have access to start epoch";
    }
  } catch (err) {
    logger.error(`Error whilte creating epoch ${err}`);
    throw `Error while creating epoch ${err}`;
  }
});

Moralis.Cloud.define("endEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var epoch = await getEpochByObjectId(request.params.epochId);
  epoch = await calcReward(epoch);
  epoch.set("active", false);

  logger.info(`Ending epoch ${JSON.stringify(epoch)}`);
  await Moralis.Object.saveAll([epoch], { useMasterKey: true });

  return epoch;
});

Moralis.Cloud.define("getEpoch", async (request) => {
  if (request.params.epochId) {
    const epoch = await getEpochObjByObjectId(request.params.epochId);
    if (epoch.length === 0) throw `Epoch ${request.params.epochId} not found`;
    return epoch[0];
  }
});

Moralis.Cloud.define("getTaskEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [
    { match: { objectId: request.params.epochId } },
    {
      lookup: {
        from: "Task",
        localField: "_id",
        foreignField: "epochId",
        as: "tasks",
      },
    },
  ];

  return await epochQuery.aggregate(pipeline);
});

Moralis.Cloud.define("giftContributors", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    var epoch = await getEpochByObjectId(request.params.epochId);
    const updatedMemberStats = await calcEffectiveVotes(
      request.params.votes,
      epoch.get("memberStats"),
      request.params.ethAddress
    );
    epoch.set("memberStats", updatedMemberStats);
    logger.info(`Saving updated member stats ${JSON.stringify(updatedMemberStats)} in epoch ${epoch.id}`);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return epoch;
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getReward", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const epochQuery = new Moralis.Query("Epoch");
    epochQuery.equalTo("objectId", request.params.epochId);
    var epoch = await epochQuery.first();
    var totalVotesAllocated = 0;
    var updatedMemberStats = epoch.get("memberStats");
    if (epoch.get("type") === "Contribution") {
      for (var member of updatedMemberStats) {
        totalVotesAllocated += member["votesReceived"];
      }
      for (var member of updatedMemberStats) {
        member["reward"] = (member["votesReceived"] * budget) / totalVotesAllocated;
      }
    }
    epoch.set("memberStats", updatedMemberStats);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });

    return epoch;
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});
