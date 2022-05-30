async function getCreatedUser(userInfo, userId, ethAddress) {
  userInfo.set('userId', userId);
  userInfo.set('tribes', []);
  userInfo.set('ethAddress', ethAddress);
  return userInfo;
}

async function getUpdatedUser(userInfo, tribes) {
  userInfo.set('tribes', tribes);
  return userInfo;
}

async function getUserByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('ethAddress', ethAddress);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByUserId(userId) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('userId', userId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByUsername(username) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('username', username);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByObjId(objectId) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('objectId', objectId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserDetailsByUserIds(userIds) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { objectId: { $in: userIds } } },
    {
      project: {
        objectId: 1,
        username: 1,
        avatar: 1,
        ethAddress: 1,
        discordId: 1,
        profilePicture: 1,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getUserIdToUserDetailsMapByUserIds(userIds) {
  const userDetails = await getUserDetailsByUserIds(userIds);
  var userDetailsMap = {};
  for (var userDetail of userDetails)
    userDetailsMap[userDetail.objectId] = userDetail;
  return userDetailsMap;
}

async function getUsernameProfilePicByUserId(userId) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { objectId: userId } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
      },
    },
  ];
  const user = await userQuery.aggregate(pipeline, { useMasterKey: true });
  if (user) return user[0];
  else return null;
}

async function getUserCount() {
  const userQuery = new Moralis.Query('User');
  return await userQuery.count({ useMasterKey: true });
}

async function getUserCountWithUsername(username) {
  const userQuery = new Moralis.Query('User');
  userQuery.equalTo('username', username);
  return await userQuery.count({ useMasterKey: true });
}

function getAllAssociatedUsersIds(board, tasks, epochs) {
  const boardMembers = board.members;
  var taskMembers = [];
  for (var task of tasks) {
    taskMembers = taskMembers.concat(task.assignee).concat(task.reviewer);
    taskMembers.push(task.creator);
    if (task.proposals) {
      for (var proposal of task.proposals) {
        taskMembers.push(proposal.userId);
      }
    }
  }

  var epochMembers = [];
  for (var epoch of epochs) {
    epochMembers = epochMembers.concat(Object.keys(epoch.memberStats));
    if (epoch.type === 'Member') {
      epochMembers = epochMembers.concat(epoch.choices);
    }
  }
  var uniqueUserIds = boardMembers
    .concat(taskMembers)
    .concat(epochMembers)
    .filter(onlyUnique);

  return uniqueUserIds;
}

Moralis.Cloud.define('getUserCount', async (request) => {
  return await getUserCount();
});

async function isUniqueUsername(username, userId) {
  const userQuery = new Moralis.Query('User');
  userQuery.equalTo('username', username);
  userQuery.notEqualTo('objectId', userId);
  return (await userQuery.count({ useMasterKey: true })) === 0;
}

Moralis.Cloud.define('updateProfile', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  if (request.user) {
    logger.info(`updateProfile ${JSON.stringify(request.user)}`);
    logger.info(`username ${JSON.stringify(request.params.username)}`);
    const unique = await isUniqueUsername(
      request.params.username,
      request.user.id
    );
    if (unique) {
      request.user.set('username', request.params.username);
      request.user.set('website', request.params.website);
      request.user.set('github', request.params.github);
      request.user.set('twitter', request.params.twitter);
      request.user.set('linkedin', request.params.linkedin);
      request.user.set('bio', request.params.bio);
      request.user.set('skills', request.params.skills);
      logger.info(`saving ${JSON.stringify(request.user)}`);

      await Moralis.Object.saveAll([request.user], {
        useMasterKey: true,
      });
      return request.user;
    } else {
      throw new Error('Username already taken');
    }
  } else {
    logger.error(`Request user is null`);
    throw 'User is not authenticated';
  }
});

Moralis.Cloud.define('getOrCreateUser', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      var userCount = await getUserCount();
      userInfo = new Moralis.Object('UserInfo');
      userInfo = await getCreatedUser(
        userInfo,
        request.user.id,
        request.user.get('ethAddress')
      );
      request.user.set('username', `fren${userCount}`);

      await Moralis.Object.saveAll([userInfo, request.user], {
        useMasterKey: true,
      });
    }
    return request.user;
  } catch (err) {
    logger.error(`Error while gettig user ${err}`);
    return false;
  }
});

async function getUserDetailsWithUsername(username) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { username: username } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
        website: 1,
        github: 1,
        twitter: 1,
        bio: 1,
        skills: 1,
      },
    },
  ];
  const user = await userQuery.aggregate(pipeline, { useMasterKey: true });
  if (user) return user[0];
  else return null;
}

async function getTribesByTribeIds(tribeIds) {
  const logger = Moralis.Cloud.getLogger();

  const tribeQuery = new Moralis.Query('Team');
  tribeQuery.containedIn('teamId', tribeIds);
  logger.info(`tribeIds ${JSON.stringify(tribeIds)}`);

  const tribes = await tribeQuery.find({ useMasterKey: true });
  var resTribes = {};
  for (var tribe of tribes) {
    resTribes[tribe.get('teamId')] = {
      id: tribe.get('teamId'),
      name: tribe.get('name'),
      logo: tribe.get('logo'),
    };
  }
  return resTribes;
}

async function getSpacesBySpaceIds(spaceIds) {
  const logger = Moralis.Cloud.getLogger();

  const spaceQuery = new Moralis.Query('Board');
  logger.info(`spaceIds ${JSON.stringify(spaceIds)}`);
  spaceQuery.containedIn('objectId', spaceIds);
  const spaces = await spaceQuery.find({ useMasterKey: true });
  logger.info(`spaces ${JSON.stringify(spaces)}`);

  var resSpaces = {};
  for (var space of spaces) {
    resSpaces[space.id] = {
      id: space.id,
      name: space.get('name'),
      teamId: space.get('teamId'),
    };
  }

  return resSpaces;
}

async function getRelevantCards(userId) {
  const cardQuery = new Moralis.Query('Task');
  const cards = await cardQuery.aggregate([], { useMasterKey: true });
  let res = [];
  for (var card of cards) {
    if (card.assignee?.includes(userId) || card.reviewer?.includes(userId)) {
      res.push({
        objectId: card.objectId,
        title: card.title,
        assignee: card.assignee,
        reviewer: card.reviewer,
        status: card.status,
        type: card.type,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        spaceId: card.boardId,
        tags: card.tags,
        action: card.assignee?.includes(userId) ? 'Worked on' : 'Reviewed',
      });
    }
  }
  return res;
}

function calculateShare(votes, userId) {
  if (!votes || !Object.keys(votes).includes(userId)) return 0;
  var votesReceived = votes[userId];
  var totalVotes = Object.values(votes).reduce((a, b) => a + b);
  return votesReceived / totalVotes;
}

async function getRelevantEpochs(userId) {
  const epochQuery = new Moralis.Query('Epoch');
  const epochs = await epochQuery.aggregate(
    [{ match: { type: 'Member', active: false } }],
    {
      useMasterKey: true,
    }
  );
  let res = [];
  for (var epoch of epochs) {
    if (Object.keys(epoch.memberStats).includes(userId)) {
      res.push({
        epoch: epoch.objectId,
        name: epoch.name,
        members: Object.keys(epoch.memberStats),
        share: calculateShare(epoch.votes, userId),
        updatedAt: epoch.updatedAt,
        spaceId: epoch.spaceId,
      });
    }
  }
  logger.info(`res getRelevantEpochs ${JSON.stringify(res)}`);
  return res;
}

Moralis.Cloud.define('getUserDetailsWithUsername', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const user = await getUserDetailsWithUsername(request.params.username);
  user.cards = await getRelevantCards(user.objectId);
  logger.info(`Found ${user.cards?.length} cards`);

  user.epochs = await getRelevantEpochs(user.objectId);
  logger.info(`Found ${user.epochs?.length} epochs`);

  const cardSpaceIds = getArrayFromArrayOfObjects(user.cards, 'spaceId');
  const epochSpaceIds = getArrayFromArrayOfObjects(user.epochs, 'spaceId');
  const spaceIds = cardSpaceIds.concat(epochSpaceIds);
  logger.info(`Found ${spaceIds?.length} space ids`);

  const uniqueSpaceIds = spaceIds.filter(onlyUnique);
  user.spaceDetails = await getSpacesBySpaceIds(uniqueSpaceIds);
  logger.info(`Found details for spaces`);

  const tribeIds = getArrayFromObjectOfObject(user.spaceDetails, 'teamId');
  logger.info(`Found ${tribeIds?.length} tribe ids`);

  const uniqueTribeIds = tribeIds.filter(onlyUnique);
  user.tribeDetails = await getTribesByTribeIds(uniqueTribeIds);
  logger.info(`Found details for tribes`);

  var taskMembers = [];
  for (var card of user.cards) {
    taskMembers = taskMembers.concat(card.assignee).concat(card.reviewer);
  }
  logger.info(`epochs ${JSON.stringify(user.epochs.length)}`);
  for (var epoch of user.epochs) {
    taskMembers = taskMembers.concat(epoch.members);
  }
  user.memberDetails = await getUserIdToUserDetailsMapByUserIds(
    taskMembers.filter(onlyUnique)
  );
  logger.info(`res`);

  return user;
});
