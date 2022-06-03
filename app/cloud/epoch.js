async function getEpochCountByTeamId(teamId) {
  const epochQuery = new Moralis.Query('Epoch');
  epochQuery.equalTo('teamId', teamId);
  return await epochQuery.count({ useMasterKey: true });
}

async function getEpochParseObjByObjectId(objectId) {
  const epochQuery = new Moralis.Query('Epoch');
  epochQuery.equalTo('objectId', objectId);
  return await epochQuery.first({ useMasterKey: true });
}

async function getEpochByObjectId(objectId, callerId) {
  const epochQuery = new Moralis.Query('Epoch');
  const pipeline = [{ match: { objectId: objectId } }];
  const epoch = await epochQuery.aggregate(pipeline, { useMasterKey: true });
  if (callerId in epoch[0].memberStats) {
    epoch[0].votesGivenByCaller = epoch[0].memberStats[callerId].votesGiven;
    epoch[0].votesAllocated = epoch[0].memberStats[callerId].votesAllocated;
    epoch[0].votesRemaining = epoch[0].memberStats[callerId].votesRemaining;
  }
  if (epoch.length > 0) {
    return epoch[0];
  } else {
    logger.info('No epochs with given object id');
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
      weightAllocated: member.votesAllocated,
    };
  }
  logger.info(`epochMembers ${JSON.stringify(members)}`);
  return epochMembers;
}

Moralis.Cloud.define('startEpoch', async (request) => {
  log(
    request.user?.id,
    `Calling startEpoch on space ${request.params.spaceId}`,
    'info'
  );
  try {
    if (request.params.members.length === 0)
      throw 'Cant create epoch with no members';
    if (request.params.choices.length < 2)
      throw 'Cant create epoch with less than 2 choices';
    const endTime =
      parseInt(request.params.startTime) + parseInt(request.params.duration);
    const epochCount = await getEpochCountByTeamId(request.params.teamId);
    const initMembersStats = initializeEpochMembers(
      request.params.members,
      request.params.choices
    );

    var epoch = new Moralis.Object('Epoch');
    epoch.set('teamId', request.params.teamId);
    epoch.set('name', request.params.name);
    epoch.set('choices', request.params.choices);
    epoch.set('spaceId', request.params.spaceId);
    epoch.set('startTime', new Date(parseInt(request.params.startTime)));
    epoch.set('duration', parseInt(request.params.duration)); // in milliseconds
    epoch.set('endTime', new Date(endTime));
    epoch.set('memberStats', initMembersStats); // list
    epoch.set('type', request.params.type);
    epoch.set('strategy', request.params.strategy);
    epoch.set('passThreshold', parseFloat(request.params.passThreshold));
    epoch.set('budget', parseFloat(request.params.budget));
    epoch.set('token', request.params.token);
    epoch.set('chain', request.params.chain);
    epoch.set('epochNumber', epochCount + 1);
    epoch.set('active', true);
    epoch.set('paid', false);
    epoch.set('nativeCurrencyPayment', request.params.nativeCurrencyPayment);

    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in startEpoch for space id ${request.params.boardId}: ${err}`,
      'error'
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
      if (memberStats[memberId].votesGiven[choice] === -1) {
        votesAgainst[choice] += 1 * memberStats[memberId].weightAllocated;
      } else if (memberStats[memberId].votesGiven[choice] === 1) {
        votesFor[choice] += 1 * memberStats[memberId].weightAllocated;
      }
    }
  }

  return [votesFor, votesAgainst];
}

Moralis.Cloud.define('endEpoch', async (request) => {
  log(
    request.user?.id,
    `Calling endEpoch on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set('active', false);
    var votes = {};
    var values = {};
    const memberStats = epoch.get('memberStats');
    if (epoch.get('strategy') === 'Quadratic voting') {
      var [totalVotes, votes] = calculateQuadraticVotes(memberStats);
      epoch.set('votes', votes);
      if (epoch.get('budget') && epoch.get('budget') > 0) {
        for (var choice of epoch.get('choices')) {
          values[choice] = (votes[choice] * epoch.get('budget')) / totalVotes;
        }
        epoch.set('values', values);
      }
    } else if (epoch.get('strategy') === 'Pass/No Pass') {
      var [votesFor, votesAgainst] = calculatePassNoPassVotes(memberStats);
      epoch.set('votesFor', votesFor);
      epoch.set('votesAgainst', votesAgainst);
    }
    logger.info(`epochhhh ${JSON.stringify(epoch)}`);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochByObjectId(request.params.epochId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in endEpoch for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `Error while ending epoch ${request.params.epochId}: ${err}`;
  }
});

function getTotalVotesGiven(votesGiven, strategy) {
  var totalVotes = 0;
  if (strategy === 'Quadratic voting') {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId] ** 2;
    }
  } else if (strategy === 'Pass/No Pass') {
    for (var objectId of Object.keys(votesGiven)) {
      totalVotes += votesGiven[objectId];
    }
  }

  return totalVotes;
}

Moralis.Cloud.define('saveVotes', async (request) => {
  log(
    request.user?.id,
    `Calling saveVotes on epoch ${request.params.epochId}`,
    'info'
  );
  try {
    const logger = Moralis.Cloud.getLogger();
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    var totalVotesGiven = getTotalVotesGiven(
      request.params.votesGiven,
      epoch.get('strategy')
    );
    logger.info(`totalVotesGivens ${JSON.stringify(totalVotesGiven)}`);
    var memberStats = epoch.get('memberStats');
    if (
      request.user.id in memberStats &&
      totalVotesGiven <= memberStats[request.user.id].votesAllocated
    ) {
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesGiven = request.params.votesGiven;
      logger.info(`memberStats ${JSON.stringify(memberStats)}`);

      memberStats[request.user.id].votesRemaining =
        memberStats[request.user.id].votesAllocated - totalVotesGiven;
    } else throw 'Votes given overshoots votes allocated';

    epoch.set('memberStats', memberStats);
    logger.info(`Saving votes ${JSON.stringify(epoch)}`);

    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return epoch;
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveVotes for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `Error while saving votes ${err}`;
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

Moralis.Cloud.define('moveCardsAfterEpoch', async (request) => {
  try {
    const epoch = await getEpochParseObjByObjectId(request.params.epochId);

    if (epoch.get('type') === 'Card') {
      for (var cardId of epoch.get('choices')) {
        if (
          (epoch.get('votesFor')[cardId] * 100) /
            (epoch.get('votesFor')[cardId] +
              epoch.get('votesAgainst')[cardId]) >=
          epoch.get('passThreshold')
        ) {
          await handleColumnChange(
            epoch.get('spaceId'),
            cardId,
            epoch.get('sourceColumnId'),
            request.params.passColumnId,
            request.user.id
          );
        } else {
          await handleColumnChange(
            epoch.get('spaceId'),
            cardId,
            epoch.get('sourceColumnId'),
            request.params.noPassColumnId,
            request.user.id
          );
        }
      }
    }
    return await getSpace(epoch.get('spaceId'), request.user.id);
  } catch (err) {
    logger.error(
      `Error while moving cards after epoch ${request.params.epochId}: ${err}`
    );
    throw `Error while moving cards after epoch ${err}`;
  }
});

async function activateEpoch() {}
async function deactivateEpoch() {}
