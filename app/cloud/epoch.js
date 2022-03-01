async function getEpochCountByTeamId(teamId) {
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("teamId", teamId);
  return await epochQuery.count();
}

async function getEpochsBySpaceId(spaceId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { spaceId: spaceId } }];
  const epochs = await epochQuery.aggregate(pipeline);
  return epochs;
}

async function getEpochByObjectId(objectId) {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { objectId: objectId } }];
  const epoch = await epochQuery.aggregate(pipeline);
  if (epoch.length > 0) return epoch[0];
  else {
    logger.info("No epochs with given object id");
    return false;
  }
}

async function getEpochNonAdminViewByObjectId(objectId) {
  const epoch = getEpochByObjectId(objectId);
  var members = [];
  for (var ep of epoch) {
    var member = {};
  }
  return await epochQuery.aggregate(pipeline);
}

function initializeEpochMembers(members) {
  var epochMembers = [];
  for (var member of members) {
    epochMembers.push({
      objectId: member.objectId,
      votesGiven: 0,
      votesReceived: 0,
      votesRemaining: member.allocation,
      votesAllocated: member.allocation,
      value: 0,
    });
  }
  logger.info(`epochMembers ${JSON.stringify(members)}`);
  return epochMembers;
}

Moralis.Cloud.define("startEpoch", async (request) => {
  try {
    const endTime =
      parseInt(request.params.startTime) + parseInt(request.params.duration);
    const epochCount = await getEpochCountByTeamId(request.params.teamId);
    var epoch = new Moralis.Object("Epoch");
    epoch.set("teamId", parseInt(request.params.teamId));
    epoch.set("name", request.params.name);
    epoch.set("spaceId", request.params.spaceId);
    epoch.set("startTime", new Date(parseInt(request.params.startTime)));
    epoch.set("duration", parseInt(request.params.duration)); // in milliseconds
    epoch.set("endTime", new Date(endTime));
    epoch.set("members", initializeEpochMembers(request.params.members)); // list
    epoch.set("type", request.params.type);
    epoch.set("strategy", request.params.strategy);
    epoch.set("budget", parseInt(request.params.budget));
    epoch.set("epochNumber", epochCount + 1);
    epoch.set("active", true);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
  } catch (err) {
    logger.error(`Error while starting epoch ${err}`);
    throw `${err}`;
  }
});

Moralis.Cloud.define("endEpoch", async (request) => {
  try {
  } catch (err) {
    logger.error(`Error while creating board ${err}`);
    throw `${err}`;
  }
});

Moralis.Cloud.define("getEpochs", async (request) => {
  try {
    return await getEpochsBySpaceId(request.params.spaceId);
  } catch (err) {
    logger.error(`Error while getting epochs ${err}`);
    throw `${err}`;
  }
});

async function activateEpoch() {}
async function deactivateEpoch() {}
