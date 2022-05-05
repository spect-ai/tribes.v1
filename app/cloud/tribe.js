async function getCreatedTribe(
  tribe,
  teamId,
  name,
  members, // List - [objectId]
  roles // Object - {"userId":"role"}
) {
  tribe.set('teamId', teamId);
  tribe.set('name', name);
  tribe.set('members', members);
  tribe.set('roles', roles);
  tribe.set('isPublic', true);
  tribe.set('theme', 0);
  return tribe;
}

async function getUpdatedTribeDetails(
  tribe,
  name,
  description,
  isPublic,
  discord,
  twitter,
  github,
  logo
) {
  tribe.set('name', name);
  tribe.set('description', description);
  tribe.set('isPublic', isPublic);
  tribe.set('discord', discord);
  tribe.set('twitter', twitter);
  tribe.set('github', github);
  tribe.set('logo', logo);
  return tribe;
}

async function getTribeCount() {
  const tribeQuery = new Moralis.Query('Team');
  return await tribeQuery.count({ useMasterKey: true });
}

async function getTribeByTeamId(teamId) {
  const teamQuery = new Moralis.Query('Team');
  teamQuery.equalTo('teamId', teamId);
  return await teamQuery.first({ useMasterKey: true });
}

async function getTribeObjByTeamId(teamId) {
  const teamQuery = new Moralis.Query('Team');
  const pipeline = [
    { match: { teamId: teamId } },
    {
      lookup: {
        from: 'Board',
        localField: 'teamId',
        foreignField: 'teamId',
        as: 'boards',
      },
    },
  ];
  return await teamQuery.aggregate(pipeline, { useMasterKey: true });
}

async function isWhitelisted(ethAddress) {
  const whitelistQuery = new Moralis.Query('Whitelist');
  whitelistQuery.equalTo('ethAddress', ethAddress);
  const whitelist = await whitelistQuery.find({ useMasterKey: true });
  return whitelist.length !== 0;
}

function joinTribeAsMember(tribe, userId) {
  const members = tribe.get('members');
  const roles = tribe.get('roles');
  members.push(userId);
  roles[userId] = 1;
  tribe.set('members', members);
  tribe.set('roles', roles);
  return tribe;
}

Moralis.Cloud.define('getTeam', async (request) => {
  log(
    request.user?.id,
    `Calling getTeam on tribe ${request.params.teamId}`,
    'info'
  );
  const logger = Moralis.Cloud.getLogger();
  try {
    logger.info(`getTeam ${request.params.teamId}`);
    const team = await getTribeObjByTeamId(request.params.teamId);
    logger.info(`getTeam ${request.params.team}`);
    if (team.length === 0) throw 'Team not found';
    team[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
      team[0].members
    );
    var resSpaces = [];
    for (var space of team[0].boards) {
      // if (canRead(space, request.user?.id)) {
      resSpaces.push(space);
      // }
    }
    team[0].boards = resSpaces;
    return team[0];
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getTeam for tribe id ${request.params.teamId}: ${err}`,
      'error'
    );
    throw `Error while getting tribe ${err}`;
  }
});

Moralis.Cloud.define('getPublicTeams', async (request) => {
  try {
    const teamQuery = new Moralis.Query('Team');
    const pipeline = [{ match: { isPublic: true } }];
    return await teamQuery.aggregate(pipeline, { useMasterKey: true });
  } catch (err) {
    log(request.user?.id, `Failure in getPublicTeams: ${err}`, 'error');
    throw `Error while getting public tribes ${err}`;
  }
});

Moralis.Cloud.define('getMyTeams', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const userInfoQuery = new Moralis.Query('UserInfo');
    userInfoQuery.equalTo('userId', request.user?.id);
    const userInfo = await userInfoQuery.first({ useMasterKey: true });
    if (userInfo) {
      const teamQuery = new Moralis.Query('Team');
      teamQuery.containedIn('teamId', userInfo.get('tribes'));
      return await teamQuery.find({ useMasterKey: true });
    }
  } catch (err) {
    logger.error(
      `Error while getting tribes of user ${request.user?.id}: ${err}`
    );
    throw `Error while getting tribes of user ${err}`;
  }
});

Moralis.Cloud.define('createTeam', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const whitelisted = await isWhitelisted(request.user.get('ethAddress'));
    if (!whitelisted)
      throw {
        code: 101,
        message: 'Please fill out the waitlist to create tribe',
      };

    var team = new Moralis.Object('Team');
    const teamId = crypto.randomUUID();
    logger.info(teamId);

    // Initialize tribe data
    var roles = {};
    roles[request.user.id] = 3;
    team = await getCreatedTribe(
      team,
      teamId,
      request.params.name,
      (members = [request.user.id]),
      roles
    );
    // Add tribe to tribe creator's user info
    const userInfo = await getUserByUserId(request.user.id);

    teamMemberships = userInfo.get('tribes').concat([teamId]);
    userInfo.set('tribes', teamMemberships);

    await Moralis.Object.saveAll([team], { useMasterKey: true });

    return team;
  } catch (err) {
    logger.error(
      `Error while creating tribe with name ${request.params.name} ${err}`
    );
    throw err;
  }
});

Moralis.Cloud.define('updateTeam', async (request) => {
  log(
    request.user?.id,
    `Calling updateTeam on tribe ${request.params.teamId}`,
    'info'
  );
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTribeByTeamId(request.params.teamId);
    logger.info('Team found');
    if (hasAccess(request.user.id, team, 3)) {
      await getUpdatedTribeDetails(
        team,
        request.params.name,
        request.params.description,
        request.params.isPublic,
        request.params.discord,
        request.params.twitter,
        request.params.github,
        request.params.logo
      );
      logger.info('Team updated');
      await Moralis.Object.saveAll([team], { useMasterKey: true });
      logger.info('Team saved');
      team = await getTribeObjByTeamId(request.params.teamId);
      team[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
        team[0].members
      );
      return team[0];
    } else {
      throw `User does not have access to update tribe`;
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateTeam for tribe id ${request.params.teamId}: ${err}`,
      'error'
    );
    throw `Error while updating tribe ${err}`;
  }
});

Moralis.Cloud.define('joinTribe', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const team = await getTribeByTeamId(request.params.teamId);
    const userInfo = await getUserByUserId(request.user.id);
    teamMemberships = userInfo.get('tribes').concat([request.params.teamId]);
    userInfo.set('tribes', teamMemberships);
    let members = team ? team.get('members') : [];
    let roles = team ? team.get('roles') : {};
    roles[request.user.id] = 1;
    members.push(request.user.id);
    team.set('members', members);
    team.set('roles', roles);
    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });
    return true;
  } catch (err) {
    logger.error(`Error while joining tribe ${err}`);
    throw err;
  }
});

Moralis.Cloud.define('updateTribeMembers', async (request) => {
  log(
    request.user?.id,
    `Calling updateTribeMembers on tribe ${request.params.teamId}`,
    'info'
  );
  try {
    if (hasAccess(request.user.id, board, 3)) {
      const teamQuery = new Moralis.Query('Team');
      teamQuery.equalTo('teamId', request.params.teamId);
      let team = await teamQuery.first({ useMasterKey: true });
      team.set('members', request.params.members);
      team.set('roles', request.params.roles);
      await Moralis.Object.saveAll([team], { useMasterKey: true });
      team = await getTribeObjByTeamId(request.params.teamId);
      team[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
        team[0].members
      );
      return team[0];
    } else {
      throw `User does not have access to update tribe`;
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateTribeMembers for tribe id ${request.params.teamId}: ${err}`,
      'error'
    );
    throw `Error while updating board members ${err}`;
  }
});

Moralis.Cloud.define('createTribe', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = new Moralis.Object('Team');
    const teamId = crypto.randomUUID();
    logger.info(teamId);

    // Initialize tribe data
    var roles = {};
    roles[request.user.id] = 3;
    team = await getCreatedTribe(
      team,
      teamId,
      request.params.name,
      [request.user.id],
      roles
    );
    // Add tribe to tribe creator's user info
    const userInfo = await getUserByUserId(request.user.id);

    teamMemberships = userInfo.get('tribes').concat([teamId]);
    userInfo.set('tribes', teamMemberships);

    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });

    return team;
  } catch (err) {
    logger.error(
      `Error while creating tribe with name ${request.params.name} ${err}`
    );
    throw err;
  }
});

Moralis.Cloud.define('changeTribeRole', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const team = await getTribeByTeamId(request.params.teamId);
    if (hasAccess(request.user.id, team, 3)) {
      const roles = team.get('roles');
      roles[request.params.userId] = request.params.role;
      team.set('roles', roles);
      await Moralis.Object.saveAll([team], { useMasterKey: true });
      let teamObj = await getTribeObjByTeamId(request.params.teamId);
      teamObj[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
        teamObj[0].members
      );
      return teamObj[0];
    } else {
      logger.info(
        `User ${request.user.id} doesnt have access to update member roles`
      );
      throw 'User doesnt have access to update member roles';
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return err;
  }
});
