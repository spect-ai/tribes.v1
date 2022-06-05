function enrichEpoch(epoch, callerId) {
  if (callerId in epoch.memberStats) {
    epoch.votesGivenByCaller = epoch.memberStats[callerId].votesGiven;
    epoch.votesAllocated = epoch.memberStats[callerId].votesAllocated;
    epoch.votesRemaining = epoch.memberStats[callerId].votesRemaining;
  }

  if (epoch.feedback && callerId in epoch.feedback) {
    epoch.feedbackGiven = epoch.feedback[callerId];
  }

  if (!epoch.active && epoch.feedback) {
    logger.info(`feed ${JSON.stringify(epoch.feedback)}`);

    let feedbackReceived = {};
    for (let [memberId, feedbackObj] of Object.entries(epoch.feedback)) {
      logger.info(`feedbackObj ${JSON.stringify(feedbackObj)}`);

      if (feedbackObj && callerId in feedbackObj) {
        feedbackReceived = Object.assign(feedbackReceived, {
          [memberId]: feedbackObj[callerId],
        });
        logger.info(`feedbackReceived ${JSON.stringify(feedbackReceived)}`);
      }
    }
    epoch.feedbackReceived = feedbackReceived;
  }

  return epoch;
}

function filterEpochFields(epoch, space, callerId) {
  if (hasAccessEntityObj(callerId, space, 3)) {
    return epoch;
  } else {
    delete epoch.memberStats;
    delete epoch.values;
    delete epoch.feedback;
  }

  return epoch;
}

async function filterEpochs(epochs, space, callerId) {
  try {
    if (hasAccessEntityObj(callerId, space, 3)) {
      return epochs.reverse();
    } else {
      var newEpochs = [];
      for (var epoch of epochs) {
        delete epoch.memberStats;
        delete epoch.values;
        delete epoch.feedback;
        newEpochs.push(epoch);
      }
      return newEpochs;
    }
  } catch (err) {
    logger.error(
      `Error while filtering epochs for space ${space.objectId}: ${err}`
    );
    throw `${err}`;
  }
}

async function getEpochsBySpace(space, callerId) {
  const epochQuery = new Moralis.Query('Epoch');
  const pipeline = [
    { match: { spaceId: space.objectId, archived: { $ne: true } } },
  ];

  var epochs = await epochQuery.aggregate(pipeline, { useMasterKey: true });

  for (var epoch of epochs) {
    epoch = enrichEpoch(epoch, callerId);
    epoch = filterEpochFields(epoch, space, callerId);
  }
  return epochs;
}

async function getEpochs(spaceId, userId) {
  try {
    let space = await getBoardObjByObjectId(spaceId);
    let epochs = await getEpochsBySpace(space[0], userId);
    epochs = await filterEpochs(epochs, space[0], userId);
    return epochs;
  } catch (err) {
    logger.error(`Error while getting epochs for space ${spaceId}: ${err}`);
    throw `${err}`;
  }
}

Moralis.Cloud.define('getPeriods', async (request) => {
  log(
    request.user?.id,
    `Calling getPeriods on epoch ${request.params.spaceId}`,
    'info'
  );
  try {
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getPeriods for space id ${request.params.spaceId}: ${err}`,
      'error'
    );
    throw err;
  }
});
