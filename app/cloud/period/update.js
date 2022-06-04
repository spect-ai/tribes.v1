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
        totalVotesGiven <= memberStats[request.user.id].votesAllocated
      ) {
        memberStats[request.user.id].votesGiven = request.params.votes;

        memberStats[request.user.id].votesRemaining =
          memberStats[request.user.id].votesAllocated - totalVotesGiven;
      } else throw 'Votes given overshoots votes allocated';

      epoch.set('memberStats', memberStats);
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
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    const epochObj = mapParseObjectToObject(epoch);
    return {
      periods: await getEpochs(epoch.get('spaceId'), request.user.id),
      currPeriod: Object.assign(
        epochObj,
        enrichEpoch(epochObj, request.user.id)
      ),
    };
  } catch (err) {
    log(
      request.user?.id,
      `Failure in saveVotesAndFeedback for epoch id ${request.params.epochId}: ${err}`,
      'error'
    );
    throw `Error while saving votes ${err}`;
  }
});

Moralis.Cloud.define('saveTitle', async (request) => {
  log(
    request.user?.id,
    `Calling saveTitle on epoch ${request.params.epochId}`,
    'info'
  );
});

Moralis.Cloud.define('saveDescription', async (request) => {
  log(
    request.user?.id,
    `Calling saveDescription on epoch ${request.params.epochId}`,
    'info'
  );
});

Moralis.Cloud.define('saveReward', async (request) => {
  log(
    request.user?.id,
    `Calling saveVotes on epoch ${request.params.epochId}`,
    'info'
  );
});

Moralis.Cloud.define('saveDeadline', async (request) => {
  log(
    request.user?.id,
    `Calling saveVotes on epoch ${request.params.epochId}`,
    'info'
  );
});
