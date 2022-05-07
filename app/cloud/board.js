async function getInviteByObjectId(objectId) {
  const inviteQuery = new Moralis.Query('Invite');
  inviteQuery.equalTo('objectId', objectId);
  return await inviteQuery.first({ useMasterKey: true });
}

async function getBoardByObjectId(objectId) {
  const boardQuery = new Moralis.Query('Board');
  boardQuery.equalTo('objectId', objectId);
  return await boardQuery.first({ useMasterKey: true });
}

async function getBoardObjByObjectId(objectId, callerId) {
  const boardQuery = new Moralis.Query('Board');
  const pipeline = [
    { match: { objectId: objectId } },
    {
      lookup: {
        from: 'Team',
        localField: 'teamId',
        foreignField: 'teamId',
        as: 'team',
      },
    },
  ];

  var board = await boardQuery.aggregate(pipeline, { useMasterKey: true });
  if (board.length === 0) throw 'Board doesnt exist';
  // if (callerId) board[0].access = getSpaceAccess(callerId, board[0]);
  return board;
}

async function getBoardObjWithTasksByObjectId(objectId, callerId) {
  var board = await getBoardObjByObjectId(objectId, callerId);
  if (board.length > 0) {
    var tasks = await getTaskObjByBoardId(objectId);
    var boardTasks = {};
    for (var task of tasks) {
      const access = getCardAccess(task, callerId);
      task.access = access;
      boardTasks[task.taskId] = task;
    }
    board[0].tasks = boardTasks;
  }
  return board;
}

async function getBoardObjWithTasksAndProposalsByObjectId(objectId, callerId) {
  var board = await getBoardObjByObjectId(objectId, callerId);
  if (board.length > 0) {
    var tasks = await getTaskObjByBoardIdWithProposals(objectId);
    var boardTasks = {};
    for (var task of tasks) {
      const access = getCardAccess(task, callerId);
      task.access = access;
      boardTasks[task.taskId] = task;
    }
    board[0].tasks = boardTasks;
  }
  return board;
}

async function getBoardObjByTeamId(teamId) {
  const boardQuery = new Moralis.Query('Board');
  const pipeline = [{ match: { teamId: teamId } }];
  return await boardQuery.aggregate(pipeline);
}

async function getEssentialBoardObjByTeamId(teamId) {
  const boardQuery = new Moralis.Query('Board');
  const pipeline = [
    { match: { teamId: teamId } },
    {
      project: {
        name: 1,
        objectId: 1,
        private: 1,
        members: 1,
      },
    },
  ];
  return await boardQuery.aggregate(pipeline);
}

function getUserRole(roles, roleMapping) {
  if (!roles) return false;
  var userRole = null;
  for (var i = 0; i < roles.length; i++) {
    if (roleMapping[roles[i]]) {
      userRole = roleMapping[roles[i]];
      break;
    }
  }
  return userRole;
}

async function getSpace(boardId, callerId) {
  try {
    // we are getting tasks twice........ CHECK THIS
    let boardObjCompact = await getBoardObjWithTasksByObjectId(
      boardId,
      callerId
    );

    if (boardObjCompact.length === 0) throw 'Board not found';
    // we are getting tasks twice........ CHECK THIS
    var boardObjDetailed = await getBoardObjWithTasksAndProposalsByObjectId(
      boardId,
      callerId
    );

    const canReadSpace = canRead(boardObjDetailed[0], callerId);
    if (!canReadSpace) throw 'You dont have access to view this space';

    const epochs = await getEpochsBySpaceId(
      boardObjDetailed[0].objectId,
      callerId
    );
    var userIds = getAllAssociatedUsersIds(
      boardObjDetailed[0],
      Object.values(boardObjDetailed[0].tasks),
      epochs
    );

    boardObjCompact[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
      userIds
    );
    return boardObjCompact[0];
  } catch (err) {
    logger.error(`Error while getting space - ${err}`);
    throw err;
  }
}

function joinSpaceAsMember(space, userId) {
  const members = space.get('members');
  const roles = space.get('roles');
  members.push(userId);
  roles[userId] = 1;
  space.set('members', members);
  space.set('roles', roles);
  return space;
}

function getBoardObjFromBoardParseObj(board) {
  return {
    objectId: board.id,
    name: board.get('name'),
    tasks: board.get('tasks'),
    columns: board.get('columns'),
    columnOrder: board.get('columnOrder'),
    teamId: board.get('teamId'),
    createdAt: board.get('createdAt'),
    updatedAt: board.get('updatedAt'),
  };
}

function handleImportTasks(board, columnMap, columnOrder) {
  board.set('columns', columnMap);
  board.set('columnOrder', columnOrder);
  return board;
}

function handleCreateBoard(
  board,
  name,
  teamId,
  columnMap,
  columnOrder,
  isPrivate,
  members,
  roles,
  tokenGating
) {
  board.set('name', name);
  board.set('teamId', teamId);
  board.set('columns', columnMap);
  board.set('columnOrder', columnOrder);
  board.set('private', isPrivate);
  board.set('defaultPayment', {
    chain: {
      chainId: '137',
      name: 'polygon',
    },
    token: {
      address: '0x0',
      symbol: 'MATIC',
    },
  });

  // TODO: Make this customizable
  board.set('members', members);
  board.set('roles', roles);
  board.set('tokenGating', tokenGating);
  return board;
}

Moralis.Cloud.define('getSpace', async (request) => {
  log(
    request.user?.id,
    `Calling getSpace on space ${request.params.boardId}`,
    'info'
  );
  try {
    return await getSpace(request.params.boardId, request.user?.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getSpace ${request.params.boardId}: ${err}`,
      'error'
    );
    throw err;
  }
});

Moralis.Cloud.define('getEssentialBoardsInfo', async (request) => {
  log(
    request.user?.id,
    `Calling getEssentialBoardsInfo for tribe id ${request.params.teamId}`,
    'info'
  );
  try {
    const spaces = await getEssentialBoardObjByTeamId(request.params.teamId);
    var resSpaces = [];
    logger.info(`spaces ${JSON.stringify(spaces)}`);
    for (var space of spaces) {
      if (canRead(space, request.user?.id)) {
        resSpaces.push(space);
      }
    }
    logger.info(`resSpaces ${JSON.stringify(resSpaces)}`);

    return resSpaces;
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getEssentialBoardsInfo for tribe id ${request.params.teamId}: ${err}`,
      'error'
    );
    throw `Error while getting spaces - ${err}`;
  }
});

Moralis.Cloud.define('initBoard', async (request) => {
  log(
    request.user?.id,
    `Calling initBoard on tribe ${request.params.teamId}`,
    'info'
  );
  try {
    const logger = Moralis.Cloud.getLogger();
    const team = await getTribeByTeamId(request.params.teamId);
    logger.info(JSON.stringify(team));
    if (hasAccess(request.user.id, team, 3)) {
      var initColumns = ['To Do', 'In Progress', 'In Review', 'Done'];
      var columnIds = [];
      var columnIdToColumnMap = {};

      for (let i = 0; i < 4; i++) {
        var columnId = `column-${i}`;
        columnIds.push(columnId);
        columnIdToColumnMap[columnIds[i]] = {
          id: columnId,
          title: initColumns[i],
          taskIds: [],
          cardType: 1,
          createCard: { 0: false, 1: false, 2: true, 3: true },
          moveCard: { 0: false, 1: true, 2: true, 3: true },
        };
        logger.info(`${JSON.stringify(columnIdToColumnMap)}`);
      }
      var board = new Moralis.Object('Board');
      board = handleCreateBoard(
        board,
        request.params.name,
        request.params.teamId,
        columnIdToColumnMap,
        columnIds,
        request.params.isPrivate,
        [request.user.id],
        { [request.user.id]: 3 }
        // request.params.tokenGating
      );
      logger.error(`Creating new board ${JSON.stringify(board)}`);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return board;
    } else {
      throw `You dont have permission to create a space`;
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in initBoard for tribe id ${request.params.teamId}: ${err}`,
      'error'
    );
    throw `Error while creating board: ${err}`;
  }
});

Moralis.Cloud.define('importTasksFromTrello', async (request) => {
  log(
    request.user?.id,
    `Calling importTasksFromTrello on space ${request.params.boardId}`,
    'info'
  );
  try {
    const logger = Moralis.Cloud.getLogger();
    let board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board = handleImportTasks(
        board,
        request.params.columnMap,
        request.params.columnOrder
      );
      await Moralis.Object.saveAll([board], { useMasterKey: true });

      logger.info(`importing trello ${JSON.stringify(board)}`);
      // board = await board.save({ useMasterKey: true });

      for (let i = 0; i < request.params.tasks.length; i++) {
        var task = new Moralis.Object('Task');
        logger.info(request.params.tasks[i].title);
        task = handleCreateTask(
          task,
          request.params.tasks[i].id, // need to fix this, duplicate tasks are being created with trello id
          board.get('defaultPayment'),
          request.params.boardId,
          request.params.tasks[i].title,
          request.params.tasks[i].value,
          request.user.id,
          request.params.tasks[i].description
        );
        await Moralis.Object.saveAll([task], { useMasterKey: true });
      }
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to import cards from Trello';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in importTasksFromTrello for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `Error while importing from trello ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('updateColumnName', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  log(
    request.user?.id,
    `Calling updateColumnName on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      var columns = board.get('columns');
      columns[request.params.columnId]['title'] = request.params.newName;
      board.set('columns', columns);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      logger.info('save completed --------------------');
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to change column name';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateColumnName for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateColumnTasks', async (request) => {
  log(
    request.user?.id,
    `Calling updateColumnTasks on space ${request.params.boardId}`,
    'info'
  );
  try {
    const logger = Moralis.Cloud.getLogger();
    var board = await getBoardByObjectId(request.params.boardId);
    var task = await getTaskByTaskId(request.params.taskId);
    if (
      hasAccess(request.user.id, board, 3) ||
      task.get('reviewer')?.includes(request.user.id) ||
      task.get('assignee')?.includes(request.user.id) ||
      task.get('creator') === request.user.id
    ) {
      var columns = board.get('columns');
      var cardLoc = findCard(board, request.params.taskId);
      var newCardLoc = request.params.updatedCardLoc;
      logger.info(`cardLoc ${JSON.stringify(cardLoc)}`);
      logger.info(`newCardLoc ${JSON.stringify(newCardLoc)}`);

      if (!cardLoc) throw 'Card not found';
      if (!board.get('columnOrder')?.includes(newCardLoc.columnId))
        throw 'Destination column doesnt exist';
      if (
        cardLoc.columnId !== newCardLoc.columnId &&
        cardLoc.cardIndex !== newCardLoc.cardIndex
      ) {
        const source = removeTaskFromColumn(
          columns[cardLoc.columnId],
          task.get('taskId')
        );
        const destination = addTaskToColumn(
          columns[newCardLoc.columnId],
          task.get('taskId'),
          newCardLoc.cardIndex
        );
        columns = {
          ...columns,
          [source.id]: source,
          [destination.id]: destination,
        };
        task.set('columnId', newCardLoc.columnId);
      } else if (cardLoc.cardIndex !== newCardLoc.cardIndex) {
        columns[cardLoc.columnId]['taskIds'].splice(cardLoc.cardIndex, 1);
        columns[cardLoc.columnId]['taskIds'].splice(
          newCardLoc.cardIndex,
          0,
          request.params.taskId
        );
      } else if (cardLoc.columnId !== newCardLoc.columnId) {
        columns[cardLoc.columnId]['taskIds'].splice(cardLoc.cardIndex, 1);
        columns[newCardLoc.columnId]['taskIds'].splice(
          newCardLoc.cardIndex,
          0,
          request.params.taskId
        );
        task.set('columnId', newCardLoc.columnId);
      }

      board.set('columns', columns);

      await Moralis.Object.saveAll([board, task], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to move this card';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateColumnTasks for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

function findCard(space, cardId) {
  const logger = Moralis.Cloud.getLogger();
  var columns = space.get('columns');
  for ([key, value] of Object.entries(columns)) {
    var cardIndex = value.taskIds.indexOf(cardId);
    if (cardIndex !== -1) {
      return { columnId: key, cardIndex: cardIndex };
    }
  }
  return null;
}

Moralis.Cloud.define('updateColumnOrder', async (request) => {
  log(
    request.user?.id,
    `Calling updateColumnOrder on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board.set('columnOrder', request.params.newColumnOrder);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to change column order';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateColumnOrder for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('addColumn', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  log(
    request.user?.id,
    `Calling addColumn on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      var columnOrder = board.get('columnOrder');
      var columns = board.get('columns');
      const columnId = `column-${Object.keys(columns).length}`;
      const newColumnOrder = [...columnOrder, columnId];
      columns[columnId] = {
        id: columnId,
        title: '',
        taskIds: [],
        cardType: 1,
        createCard: { 0: false, 1: false, 2: true, 3: true },
        moveCard: { 0: false, 1: true, 2: true, 3: true },
      };
      logger.info(`columnId ${JSON.stringify(columnId)}`);
      logger.info(`Adding column ${JSON.stringify(newColumnOrder)}`);
      board.set('columnOrder', newColumnOrder);
      board.set('columns', columns);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to add column';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in addColumn for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('removeColumn', async (request) => {
  log(
    request.user?.id,
    `Calling removeColumn on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      var columnOrder = board
        .get('columnOrder')
        .filter((id) => id !== request.params.columnId);
      var columns = board.get('columns');
      // delete columns[request.params.columnId];
      board.set('columnOrder', columnOrder);
      board.set('columns', columns);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to remove column';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in removeColumn for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateBoard', async (request) => {
  log(
    request.user?.id,
    `Calling updateBoard on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board.set('name', request.params.name);
      board.set('defaultPayment', request.params.defaultPayment);
      board.set('tokenGating', request.params.tokenGating);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to update this space';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateBoard for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('deleteBoard', async (request) => {
  log(
    request.user?.id,
    `Calling deleteBoard on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board && (await board.destroy({ useMasterKey: true }));
      return true;
    } else {
      throw 'You do not have permission to delete this space';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in deleteBoard for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateBoardMembers', async (request) => {
  log(
    request.user?.id,
    `Calling updateBoardMembers on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board.set('members', request.params.members);
      board.set('roles', request.params.roles);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to update space members';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateBoardMembers for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateThemeFromSpace', async (request) => {
  log(
    request.user?.id,
    `Calling updateThemeFromSpace on space ${request.params.boardId}`,
    'info'
  );
  try {
    const tribeQuery = new Moralis.Query('Team');
    tribeQuery.equalTo('teamId', request.params.teamId);
    let tribe = await tribeQuery.first();
    tribe.set('theme', request.params.theme);
    await Moralis.Object.saveAll([tribe], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateThemeFromSpace for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateColumnSettings', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      const columns = board.get('columns');
      const column = columns[request.params.columnId];
      column.createCard = request.params.createCardRoles;
      column.discordChannels = request.params.channels;
      column.title = request.params.title;
      // columns[request.params.columnId].moveCard = request.params.moveCardRoles;
      board.set('columns', columns);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to update column settings';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in updateColumnPermissions for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('setSpaceRoleMapping', async (request) => {
  log(
    request.user?.id,
    `Calling setSpaceRoleMapping on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      board.set('roleMapping', request.params.roleMapping);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      throw 'You do not have permission to set roles';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in setSpaceRoleMapping for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('joinSpace', async (request) => {
  log(
    request.user?.id,
    `Calling joinSpace on space ${request.params.boardId}`,
    'info'
  );
  const logger = Moralis.Cloud.getLogger();
  try {
    const callerId = request.user.id;
    const userInfo = await getUserByUserId(callerId);
    const board = await getBoardByObjectId(request.params.boardId);
    let boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      callerId
    );
    const tribe = await getTribeByTeamId(board.get('teamId'));
    const res = await Moralis.Cloud.httpRequest({
      url: 'https://spect-discord-bot.herokuapp.com/api/userRoles',
      params: {
        userId: request.user.get('discordId'),
        guildId: tribe.get('guildId'),
      },
    });
    logger.info(
      `----------------------------------------------- ${JSON.stringify(
        res.data.guildRoles
      )}`
    );
    if (!res.data) {
      throw 'Something went wrong while getting user data from discord';
    }
    let boardRoles = board.get('roles');
    let tribeRoles = tribe.get('roles');
    if (boardObj[0].roleMapping) {
      const userRole = getUserRole(
        res.data.guildRoles,
        boardObj[0].roleMapping
      );
      if (userRole) {
        boardRoles[callerId] = userRole;
        logger.info(`userRole ${userRole}`);
        if (!board.get('members').includes(callerId)) {
          board.set('members', board.get('members').concat(callerId));
        }
        if (!tribe.get('members').includes(callerId)) {
          tribe.set('members', tribe.get('members').concat(callerId));
          tribeRoles[callerId] = 1;
          tribe.set('roles', tribeRoles);
          userInfo.set(
            'tribes',
            userInfo.get('tribes').concat(tribe.get('teamId'))
          );
        }
        board.set('roles', boardRoles);
      } else {
        logger.info('inside else');
        throw "User doesn't have any role in this guild";
      }
    }
    await Moralis.Object.saveAll([board, tribe, userInfo], {
      useMasterKey: true,
    });
    return await getSpace(request.params.boardId, request.user?.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in joinSpace for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('generateInviteLink', async (request) => {
  log(
    request.user?.id,
    `Calling generateInviteLink on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (!request.user) {
      throw 'User not authenticated';
    }
    if (board.get('roles')[request.user.id] !== 3) {
      throw 'You do not have permission to invite people';
    }
    const invite = new Moralis.Object('Invite');
    invite.set('boardId', request.params.boardId);
    invite.set('role', request.params.role);
    invite.set('uses', request.params.uses);
    invite.set('expiry', request.params.expiry);
    const inviteRes = await Moralis.Object.saveAll([invite], {
      useMasterKey: true,
    });
    return inviteRes;
  } catch (err) {
    log(
      request.user?.id,
      `Failure in generateInviteLink for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('joinSpaceFromInvite', async (request) => {
  log(
    request.user?.id,
    `Calling joinSpaceFromInvite on space ${request.params.boardId}`,
    'info'
  );
  try {
    if (!request.user) {
      throw 'User not authenticated';
    }
    if (!request.params.inviteCode) {
      throw 'Invite code not provided';
    }
    const invite = await getInviteByObjectId(request.params.inviteCode);
    if (!invite) {
      throw 'Invite code not found';
    }
    const board = await getBoardByObjectId(request.params.boardId);
    if (board.get('members').includes(request.user.id)) {
      throw 'User already a member of this board';
    }
    const tribe = await getTribeByTeamId(board.get('teamId'));
    const userInfo = await getUserByUserId(request.user.id);
    if (checkIfUserInviteValid(invite)) {
      invite.set('uses', invite.get('uses') - 1);
      let boardRoles = board.get('roles');
      let tribeRoles = tribe.get('roles');
      boardRoles[request.user.id] = invite.get('role');
      board.set('members', board.get('members').concat(request.user.id));
      board.set('roles', boardRoles);
      if (!tribe.get('members').includes(request.user.id)) {
        tribe.set('members', tribe.get('members').concat(request.user.id));
        tribeRoles[request.user.id] = 1;
        tribe.set('roles', tribeRoles);
        userInfo.set(
          'tribes',
          userInfo.get('tribes').concat(tribe.get('teamId'))
        );
      }
      await Moralis.Object.saveAll([invite, board, tribe, userInfo], {
        useMasterKey: true,
      });
    }
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    log(
      request.user?.id,
      `Failure in joinSpaceFromInvite for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

function checkIfUserInviteValid(invite) {
  const now = new Date();
  const expiry = new Date(
    invite.get('createdAt').getTime() + invite.get('expiry') * 1000
  );
  if (now > expiry && invite.get('expiry') !== 0) {
    throw 'Invite link expired';
  }
  if (invite.get('uses') === 0) {
    throw 'Invite link used up';
  }
  return true;
}

Moralis.Cloud.define('changeSpaceRole', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  log(
    request.user?.id,
    `Calling changeSpaceRole on space ${request.params.boardId}`,
    'info'
  );
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    if (hasAccess(request.user.id, board, 3)) {
      const roles = board.get('roles');
      roles[request.params.userId] = request.params.role;
      board.set('roles', roles);
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return await getSpace(request.params.boardId, request.user.id);
    } else {
      logger.info(
        `User ${request.user.id} doesnt have access to update member roles`
      );
      throw 'User doesnt have access to update member roles';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in changeSpaceRole for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

// Moralis.Cloud.define('getForumViewTasks', async (request) => {
//   const logger = Moralis.Cloud.getLogger();
//   try {
//     var board = await getBoardObjByObjectId(
//       request.params.spaceId,
//       request.user.id
//     );
//     if (board.length > 0) {
//       var tasks = await getTaskObjByColumnId(
//         request.params.spaceId,
//         request.params.columnId
//       );
//       var boardTasks = {};
//       for (var task of tasks) {
//         const access = getCardAccess(task, request.user.id);
//         task.access = access;
//         boardTasks[task.taskId] = task;
//       }
//       board[0].tasks = boardTasks;
//     }
//     return tasks;
//   } catch (err) {
//     logger.error(`Error while creating team ${err}`);
//     return err;
//   }
// });
