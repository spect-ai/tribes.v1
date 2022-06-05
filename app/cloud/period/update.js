function getTotalVotesGiven(votesGiven, strategy) {
  var totalVotes = 0;
  if (strategy?.toUpperCase() === 'QUADRATIC VOTING') {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId] ** 2;
    }
  } else if (strategy?.toUpperCase() === 'NORMAL VOTING') {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId];
    }
  }

  return totalVotes;
}

function allVotedCanReceive(votes, choices) {
  for (var memberId of Object.keys(votes)) {
    if (!choices.includes(memberId)) return votes[memberId] === 0;
  }

  return true;
}

function noVotedIsCaller(votes, caller) {
  for (var memberId of Object.keys(votes)) {
    if (memberId === caller) return votes[memberId] === 0;
  }

  return true;
}

Moralis.Cloud.define('saveVotesAndFeedback', async (request) => {
  log(
    request.user?.id,
    `Calling saveVotesAndFeedback on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    var memberStats = epoch.get('memberStats');
    if (request.params.votes) {
      var totalVotesGiven = getTotalVotesGiven(
        request.params.votes,
        epoch.get('strategy')
      );
      if (
        request.user.id in memberStats &&
        totalVotesGiven <= memberStats[request.user.id].votesAllocated &&
        allVotedCanReceive(request.params.votes, epoch.get('choices')) &&
        noVotedIsCaller(request.params.votes, request.user.id)
      ) {
        memberStats[request.user.id].votesGiven = request.params.votes;

        memberStats[request.user.id].votesRemaining =
          memberStats[request.user.id].votesAllocated - totalVotesGiven;
        epoch.set('memberStats', memberStats);
      } else throw 'Votes given is invalid';
    }
    if (request.params.feedback) {
      let feedback = epoch.get('feedback');
      if (feedback) {
        feedback[request.user.id] = Object.assign(
          feedback[request.user.id],
          request.params.feedback
        );
      } else {
        feedback = { [request.user.id]: request.params.feedback };
      }
      epoch.set('feedback', feedback);
    }
    if (request.params.votes || request.params.feedback)
      await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    else throw 'No votes or feedback given';
    const epochObj = mapParseObjectToObject(epoch);

    let space = await getBoardObjByObjectId(epochObj.spaceId, request.user.id);
    return {
      periods: await getEpochs(epoch.get('spaceId'), request.user.id),
      currPeriod: Object.assign(
        epochObj,
        filterEpochFields(
          enrichEpoch(epochObj, request.user.id),
          space[0],
          request.user.id
        )
      ),
    };
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveVotesAndFeedback for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('saveTitle', async (request) => {
  log(
    request.user?.id,
    `Calling saveTitle on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    let space = await getBoardObjByObjectId(epoch.spaceId)[0];
    if (hasAccessEntityObj(request.user.id, space, 3)) {
      if (request.params.title) {
        epoch.set('title', request.params.title);
        await Moralis.Object.saveAll([epoch], { useMasterKey: true });
      } else throw 'Title cannot be empty';
      const epochObj = mapParseObjectToObject(epoch);
      return {
        periods: await getEpochs(epoch.get('spaceId'), request.user.id),
        currPeriod: Object.assign(
          epochObj,
          filterEpochFields(
            enrichEpoch(epochObj, request.user.id),
            space,
            request.user.id
          )
        ),
      };
    } else throw 'You do not have access to update title';
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveTitle for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('saveDescription', async (request) => {
  log(
    request.user?.id,
    `Calling saveDescription on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    let space = await getBoardObjByObjectId(epoch.spaceId)[0];
    if (hasAccessEntityObj(request.user.id, space, 3)) {
      if (request.params.description) {
        epoch.set('description', request.params.description);
        await Moralis.Object.saveAll([epoch], { useMasterKey: true });
      }
      const epochObj = mapParseObjectToObject(epoch);
      return {
        periods: await getEpochs(epoch.get('spaceId'), request.user.id),
        currPeriod: Object.assign(
          epochObj,
          filterEpochFields(
            enrichEpoch(epochObj, request.user.id),
            space,
            request.user.id
          )
        ),
      };
    } else throw 'You do not have access to update description';
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveDescription for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('saveReward', async (request) => {
  log(
    request.user?.id,
    `Calling saveReward on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    let space = await getBoardObjByObjectId(epoch.spaceId)[0];
    if (hasAccessEntityObj(request.user.id, space, 3)) {
      epoch.set('budget', request.params.budget);
      epoch.set('token', request.params.token);
      epoch.set('chain', request.params.chain);
      await Moralis.Object.saveAll([epoch], { useMasterKey: true });
      const epochObj = mapParseObjectToObject(epoch);
      return {
        periods: await getEpochs(epoch.get('spaceId'), request.user.id),
        currPeriod: Object.assign(
          epochObj,
          filterEpochFields(
            enrichEpoch(epochObj, request.user.id),
            space,
            request.user.id
          )
        ),
      };
    } else throw 'You do not have access to this update the retro period';
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveReward for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('saveDeadline', async (request) => {
  log(
    request.user?.id,
    `Calling saveDeadline on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    let space = await getBoardObjByObjectId(epoch.spaceId)[0];
    if (hasAccessEntityObj(request.user.id, space, 3)) {
      epoch.set('endtime', request.params.endtime);
      await Moralis.Object.saveAll([epoch], { useMasterKey: true });
      const epochObj = mapParseObjectToObject(epoch);
      return {
        periods: await getEpochs(epoch.get('spaceId'), request.user.id),
        currPeriod: Object.assign(
          epochObj,
          filterEpochFields(
            enrichEpoch(epochObj, request.user.id),
            space,
            request.user.id
          )
        ),
      };
    } else throw 'You do not have access to this update the retro period';
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveDeadline for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

function calculateNumericVotes(memberStats, choices) {
  var totalVotes = 0;
  var votes = {};

  for (var memberId of Object.keys(memberStats)) {
    for (var choice of Object.keys(memberStats[memberId].votesGiven)) {
      if (choices.includes(choice)) {
        if (!(choice in votes)) {
          votes[choice] = 0;
        }
        votes[choice] += memberStats[memberId].votesGiven[choice];
        totalVotes += memberStats[memberId].votesGiven[choice];
      }
    }
  }

  return [totalVotes, votes];
}

Moralis.Cloud.define('endRetroPeriod', async (request) => {
  log(
    request.user?.id,
    `Calling endEpoch on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    let space = await getBoardObjByObjectId(epoch.get('spaceId'));
    if (hasAccessEntityObj(request.user.id, space[0], 3)) {
      epoch.set('active', false);
      var votes = {};
      var values = {};
      var [totalVotes, votes] = calculateNumericVotes(
        epoch.get('memberStats'),
        epoch.get('choices')
      );
      epoch.set('votes', votes);
      if (epoch.get('budget') && epoch.get('budget') > 0) {
        for (var choice of epoch.get('choices')) {
          values[choice] = (votes[choice] * epoch.get('budget')) / totalVotes;
        }
        epoch.set('values', values);
      }
      logger.info(`epoch ${JSON.stringify(epoch)}`);

      await Moralis.Object.saveAll([epoch], { useMasterKey: true });
      const epochObj = mapParseObjectToObject(epoch);
      return {
        periods: await getEpochs(epoch.get('spaceId'), request.user.id),
        currPeriod: Object.assign(
          epochObj,
          filterEpochFields(
            enrichEpoch(epochObj, request.user.id),
            space[0],
            request.user.id
          )
        ),
      };
    } else throw 'You do not have access to end the retro period';
  } catch (err) {
    log(
      request.user?.id,
      `Failure in endEpoch for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `Error while ending epoch ${request.params.epochId}: ${err}`;
  }
});

Moralis.Cloud.define('completeEpochPayment', async (request) => {
  log(
    request.user?.id,
    `Calling completeEpochPayment on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    const epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set('paid', true);
    epoch.set('transactionHash', request.params.transactionHash);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in completeEpochPayment for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `Error while completing epoch payment ${err}`;
  }
});
