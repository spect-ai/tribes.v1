async function enrichEpoch(epoch, callerId) {
  if (callerId in epoch.memberStats) {
    epoch.votesGivenByCaller = epoch.memberStats[callerId].votesGiven;
    epoch.votesAllocated = epoch.memberStats[callerId].votesAllocated;
    epoch.votesRemaining = epoch.memberStats[callerId].votesRemaining;
  }
  if (epoch.feedback && callerId in epoch.feedback) {
    epoch.feedbackGiven = epoch.feedback[callerId];
  }
  return epoch;
}

async function getEpochsBySpaceId(spaceId, callerId) {
  const epochQuery = new Moralis.Query('Epoch');
  const pipeline = [{ match: { spaceId: spaceId, archived: { $ne: true } } }];
  var epochs = await epochQuery.aggregate(pipeline, { useMasterKey: true });
  for (var epoch of epochs) {
    epoch = enrichEpoch(epoch, callerId);
  }
  return epochs;
}

async function filterEpochs(epochs, spaceId, callerId) {
  try {
    const space = await getBoardByObjectId(spaceId);

    if (hasAccess(callerId, space, 3)) {
      return epochs.reverse();
    } else {
      return epochs
        .filter((epoch) => epoch.active)
        .filter((epoch) => epoch.memberStats)
        .filter(epoch.values)
        .reverse();
    }
  } catch (err) {
    logger.error(`Error while filtering epochs for space ${spaceId}: ${err}`);
    throw `Error while filtering epochs ${err}`;
  }
}

async function getEpochs(spaceId, userId) {
  try {
    let epochs = await getEpochsBySpaceId(spaceId, userId);
    epochs = await filterEpochs(epochs, spaceId, userId);
    return epochs;
  } catch (err) {
    logger.error(`Error while getting epochs for space ${spaceId}: ${err}`);
    throw `Error while getting epochs ${err}`;
  }
}

Moralis.Cloud.define('getPeriods', async (request) => {
  log(
    request.user?.id,
    `Calling getEpochs on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getEpochs for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw err;
  }
});
