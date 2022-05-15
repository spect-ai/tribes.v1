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
    logger.error(`Error while getting board - ${err}`);
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
  return await getSpace(request.params.boardId, request.user?.id);
});

Moralis.Cloud.define('getEssentialBoardsInfo', async (request) => {
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
    logger.error(`Error while getting boards - ${err}`);
    throw `Error while getting boards - ${err}`;
  }
});

Moralis.Cloud.define('initBoard', async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const team = await getTribeByTeamId(request.params.teamId);
    logger.info(JSON.stringify(team));
    if (isMember(request.user.id, team)) {
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
    }
    // } else {
    //   logger.info(`User ${request.user.id} is not a member of the tribe`);
    //   throw `User ${request.user.id} is not a member of the tribe`;
    // }
  } catch (err) {
    logger.error(
      `Error while creating board with name ${request.params.name}: ${err}`
    );
    throw `Error while creating board: ${err}`;
  }
});

Moralis.Cloud.define('importTasksFromTrello', async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    let board = await getBoardByObjectId(request.params.boardId);
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
  } catch (err) {
    logger.error(
      `Error while creating space from trello ${request.params.teamId}: ${err}`
    );
    throw `Error while creating space from trello ${request.params.teamId}: ${err}`;
  }
});

Moralis.Cloud.define('updateColumnName', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columns = board.get('columns');
    columns[request.params.columnId]['title'] = request.params.newName;
    board.set('columns', columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    logger.info('save completed --------------------');
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating column name in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column name in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('updateColumnTasks', async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    var board = await getBoardByObjectId(request.params.boardId);
    var task = await getTaskByTaskId(request.params.taskId);
    var columns = board.get("columns");
    var cardLoc = findCard(board, request.params.taskId);
    var newCardLoc = request.params.updatedCardLoc;
    if (!cardLoc) throw "Card not found";
    logger.info(`cardLoc ${JSON.stringify(cardLoc)}`);
    logger.info(`newCardLoc ${JSON.stringify(newCardLoc)}`);
    if (cardLoc.columnId === newCardLoc.columnId) {
      if (cardLoc.cardIndex !== newCardLoc.cardIndex) {
        columns[cardLoc.columnId]["taskIds"].splice(cardLoc.cardIndex, 1);
        columns[cardLoc.columnId]["taskIds"].splice(
          newCardLoc.cardIndex,
          0,
          request.params.taskId
        );
        board.set("columns", columns);
      }
    } else {
      const source = removeTaskFromColumn(
        columns[cardLoc.columnId],
        task.get("taskId")
      );
      logger.info(`source ${JSON.stringify(source)}`);
      const destination = addTaskToColumn(
        columns[newCardLoc.columnId],
        task.get("taskId")
      );
      logger.info(`destination ${JSON.stringify(destination)}`);
      columns = {
        ...columns,
        [source.id]: source,
        [destination.id]: destination,
      };
      board.set("columns", columns);
      task.set("columnId", newCardLoc.columnId);
    }
    await Moralis.Object.saveAll([board, task], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating column tasks in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column tasks in board ${request.params.boardId}: ${err}`;
  }
});

function findCard(space, cardId) {
  const logger = Moralis.Cloud.getLogger();
  var columns = space.get("columns");
  for ([key, value] of Object.entries(columns)) {
    var cardIndex = value.taskIds.indexOf(cardId);
    if (cardIndex !== -1) {
      return { columnId: key, cardIndex: cardIndex };
    }
  }
  return null;
}

Moralis.Cloud.define("updateColumnOrder", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set('columnOrder', request.params.newColumnOrder);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating column order in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column order in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('addColumn', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
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
  } catch (err) {
    logger.error(
      `Error while adding column in board ${request.params.boardId}: ${err}`
    );
    throw `Error while adding column in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('removeColumn', async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columnOrder = board
      .get('columnOrder')
      .filter((id) => id !== request.params.columnId);
    var columns = board.get('columns');
    // delete columns[request.params.columnId];
    board.set('columnOrder', columnOrder);
    board.set('columns', columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while removing column in board ${request.params.boardId}: ${err}`
    );
    throw `Error while removing column in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('updateBoard', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set('name', request.params.name);
    board.set('defaultPayment', request.params.defaultPayment);
    board.set('tokenGating', request.params.tokenGating);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board ${request.params.boardId}: ${err}`;
  }
});

// PERM NEEDED
Moralis.Cloud.define('deleteBoard', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board && (await board.destroy({ useMasterKey: true }));
    return true;
  } catch (err) {
    logger.error(
      `Error while deleting board ${request.params.boardId}: ${err}`
    );
    throw `Error while deleting board ${request.params.boardId}: ${err}`;
  }
});

// PERM NEEDED
Moralis.Cloud.define('updateBoardMembers', async (request) => {
  try {
    const boardQuery = new Moralis.Query('Board');
    boardQuery.equalTo('objectId', request.params.boardId);
    const board = await boardQuery.first({ useMasterKey: true });
    board.set('members', request.params.members);
    board.set('roles', request.params.roles);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating board members on board id ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board members ${err}`;
  }
});

// Moralis.Cloud.define("joinSpace", async (request) => {
//   try {
//     const boardQuery = new Moralis.Query("Board");
//     boardQuery.equalTo("objectId", request.params.boardId);
//     const web3 = Moralis.web3ByChain(request.params.chainIdHex);
//     let board = await boardQuery.first({ useMasterKey: true });
//     if (board.get("members").indexOf(request.user.id) !== -1) {
//       throw "User already in space";
//     }
//     if (
//       !(
//         board.get("tokenGating").token.address &&
//         board.get("tokenGating").tokenLimit > 0
//       )
//     ) {
//       throw "Token gating not set up";
//     }
//     let tribe = await getTribeByTeamId(board.get("teamId"));
//     const tokenGating = board.get("tokenGating");

//     if (tokenGating.token.address === "0x0") {
//       const balance = await getNativeCurrencyBalance(
//         tokenGating.chain.name,
//         request.user.get("ethAddress")
//       );
//       if (web3.utils.fromWei(balance.balance) >= tokenGating.tokenLimit) {
//         if (tribe.get("members").indexOf(request.user.id) === -1) {
//           tribe = joinTribeAsMember(tribe, request.user.id);
//         }
//         board = joinSpaceAsMember(board, request.user.id);
//         await Moralis.Object.saveAll([tribe, board], { useMasterKey: true });
//         return await getSpace(request.params.boardId, request.user.id);
//       } else {
//         throw `Not enough balance to join this space. Need atleast ${tokenGating.tokenLimit} ${tokenGating.token.symbol} `;
//       }
//     }
//     const balances = await getTokenBalances(
//       tokenGating.chain.name,
//       request.user.get("ethAddress")
//     );
//     const token = balances.filter(
//       (b) => b.token_address.toLowerCase() === tokenGating.token.address
//     );
//     if (
//       token[0] &&
//       web3.utils.fromWei(token[0].balance.toString()) >= tokenGating.tokenLimit
//     ) {
//       if (tribe.get("members").indexOf(request.user.id) === -1) {
//         tribe = joinTribeAsMember(tribe, request.user.id);
//       }
//       board = joinSpaceAsMember(board, request.user.id);
//       await Moralis.Object.saveAll([tribe, board], { useMasterKey: true });
//       return await getSpace(request.params.boardId, request.user.id);
//     } else {
//       throw `Not enough balance to join this space. Need atleast ${tokenGating.tokenLimit} ${tokenGating.token.symbol} `;
//     }
//   } catch (err) {
//     logger.error(
//       `Error while joining space with space id ${request.params.boardId} : ${err}`
//     );
//     throw `Error while joining space ${err}`;
//   }
// });

Moralis.Cloud.define('updateThemeFromSpace', async (request) => {
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
    logger.error(
      `Error while updating theme on board id ${request.params.boardId}: ${err}`
    );
    throw `Error while updating theme ${err}`;
  }
});

Moralis.Cloud.define('updateColumnPermissions', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    const columns = board.get('columns');
    columns[request.params.columnId].createCard =
      request.params.createCardRoles;
    columns[request.params.columnId].moveCard = request.params.moveCardRoles;
    board.set('columns', columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('setSpaceRoleMapping', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set('roleMapping', request.params.roleMapping);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return await getSpace(request.params.boardId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('joinSpace', async (request) => {
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
    logger.error(
      `Error while updating board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define('generateInviteLink', async (request) => {
  const logger = Moralis.Cloud.getLogger();
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
    logger.error(
      `Error while generating invite link on board id ${request.params.boardId}: ${err}`
    );
    throw `Error while generating invite link ${err}`;
  }
});

Moralis.Cloud.define('joinSpaceFromInvite', async (request) => {
  const logger = Moralis.Cloud.getLogger();
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
    logger.error(
      `Error while generating invite link on board id ${request.params.boardId}: ${err}`
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
    logger.error(`Error while creating team ${err}`);
    return err;
  }
});
