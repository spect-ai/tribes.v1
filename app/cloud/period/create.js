function initializeMemberStats(members, choices) {
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

Moralis.Cloud.define('createPeriod', async (request) => {
  log(
    request.user?.id,
    `Calling createPeriod on space ${request.params.spaceId}`,
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
    const initMembersStats = initializeMemberStats(
      request.params.members,
      request.params.choices
    );

    var epoch = new Moralis.Object('Epoch');
    epoch.set('teamId', request.params.teamId);
    epoch.set('spaceId', request.params.spaceId);
    epoch.set('name', request.params.name);
    epoch.set('description', request.params.description);
    epoch.set('choices', request.params.choices);
    epoch.set('startTime', new Date(parseInt(request.params.startTime)));
    epoch.set('duration', parseInt(request.params.duration)); // in milliseconds
    epoch.set('endTime', new Date(endTime));
    epoch.set('memberStats', initMembersStats); // list
    epoch.set('type', request.params.type);
    epoch.set('strategy', request.params.strategy);
    epoch.set('passThreshold', parseFloat(request.params.passThreshold));
    epoch.set('budget', parseFloat(request.params.value));
    epoch.set('token', request.params.token);
    epoch.set('chain', request.params.chain);
    epoch.set('epochNumber', epochCount + 1);
    epoch.set('active', true);
    epoch.set('paid', false);

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
