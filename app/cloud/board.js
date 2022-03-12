async function getBoardByObjectId(objectId) {
  const boardQuery = new Moralis.Query("Board");
  boardQuery.equalTo("objectId", objectId);
  return await boardQuery.first();
}

async function getBoardObjByObjectId(objectId, callerId) {
  const boardQuery = new Moralis.Query("Board");
  const pipeline = [
    { match: { objectId: objectId } },
    {
      lookup: {
        from: "Team",
        localField: "teamId",
        foreignField: "teamId",
        as: "team",
      },
    },
  ];

  var board = await boardQuery.aggregate(pipeline);
  var memberDetails = await getUserIdToUserDetailsMapByUserIds(
    board[0].members
  );
  board[0].memberDetails = memberDetails;
  board[0].access = getSpaceAccess(callerId, board[0]);
  return board;
}

async function getBoardObjWithTasksByObjectId(objectId, callerId) {
  var board = await getBoardObjByObjectId(objectId, callerId);
  if (board) {
    var tasks = await getTaskObjByBoardId(objectId);
    var boardTasks = {};
    for (var task of tasks) {
      const access = getFieldLevelAccess(task, callerId);
      task.access = access;
      boardTasks[task.taskId] = task;
    }
    board[0].tasks = boardTasks;
  }

  return board;
}

async function getBoardObjByTeamId(teamId) {
  const boardQuery = new Moralis.Query("Board");
  const pipeline = [{ match: { teamId: parseInt(teamId) } }];
  return await boardQuery.aggregate(pipeline);
}

function joinSpaceAsMember(space, userId) {
  const members = space.get("members");
  const roles = space.get("roles");
  members.push(userId);
  roles[userId] = "member";
  space.set("members", members);
  space.set("roles", roles);
  return space;
}

function getBoardObjFromBoardParseObj(board) {
  return {
    objectId: board.id,
    name: board.get("name"),
    tasks: board.get("tasks"),
    columns: board.get("columns"),
    columnOrder: board.get("columnOrder"),
    teamId: board.get("teamId"),
    createdAt: board.get("createdAt"),
    updatedAt: board.get("updatedAt"),
  };
}

Moralis.Cloud.define("getBoard", async (request) => {
  try {
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    if (boardObj.length === 0) throw "Board not found";
    boardObj[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
      boardObj[0].members
    );
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while getting board - ${err}`);
    throw `Error while getting board - ${err}`;
  }
});

Moralis.Cloud.define("getBoards", async (request) => {
  try {
    return await getBoardObjByTeamId(request.params.teamId);
  } catch (err) {
    logger.error(`Error while getting boards - ${err}`);
    throw `Error while getting boards - ${err}`;
  }
});

Moralis.Cloud.define("initBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const team = await getTribeByTeamId(request.params.teamId);
    logger.info(JSON.stringify(team));
    if (isMember(request.user.id, team)) {
      var initColumns = ["To Do", "In Progress", "In Review", "Done"];
      var initBoardStatusList = ["Open", "In Progress", "Submitted", "Closed"];
      var columnIds = [];
      var columnIdToColumnMap = {};

      for (let i = 0; i < 4; i++) {
        var columnId = `column-${i}`;
        columnIds.push(columnId);
        columnIdToColumnMap[columnIds[i]] = {
          id: columnId,
          title: initColumns[i],
          taskIds: [],
          status: initBoardStatusList[i],
        };
        logger.info(`${JSON.stringify(columnIdToColumnMap)}`);
      }
      var board = new Moralis.Object("Board");
      board.set("name", request.params.name);
      board.set("teamId", parseInt(request.params.teamId));
      board.set("columns", columnIdToColumnMap);
      board.set("columnOrder", columnIds);
      board.set("statusList", initBoardStatusList);

      // TODO: Make this customizable
      board.set("members", request.params.members);
      board.set("roles", request.params.roles);
      board.set("tokenGating", request.params.tokenGating);

      logger.error(`Creating new board ${JSON.stringify(board)}`);

      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return board;
    } else {
      logger.info(`User ${request.user.id} is not a member of the tribe`);
      throw `User ${request.user.id} is not a member of the tribe`;
    }
  } catch (err) {
    logger.error(
      `Error while creating board with name ${request.params.name}: ${err}`
    );
    throw `Error while creating board: ${err}`;
  }
});

Moralis.Cloud.define("updateColumnName", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columns = board.get("columns");
    columns[request.params.columnId]["title"] = request.params.newName;
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    logger.info("save completed --------------------");
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    logger.info(`Updated column name ${JSON.stringify(boardObj)}`);
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating column name in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column name in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("updateColumnTasks", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoardByObjectId(request.params.boardId);
    var columns = board.get("columns");
    if (request.params.sourceId === request.params.destinationId) {
      columns[request.params.sourceId]["taskIds"] = request.params.source;
    } else {
      columns[request.params.sourceId] = request.params.source;
      columns[request.params.destinationId] = request.params.destination;
    }
    board.set("columns", columns);
    logger.info(`Updating column tasks ${JSON.stringify(columns)}`);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating column tasks in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column tasks in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("updateColumnOrder", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set("columnOrder", request.params.newColumnOrder);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating column order in board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating column order in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("addColumn", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columnOrder = board.get("columnOrder");
    var columns = board.get("columns");
    const columnId = `column-${Object.keys(columns).length}`;
    const newColumnOrder = [...columnOrder, columnId];
    columns[columnId] = { id: columnId, title: "", taskIds: [] };
    logger.info(`columnId ${JSON.stringify(columnId)}`);
    logger.info(`Adding column ${JSON.stringify(newColumnOrder)}`);
    board.set("columnOrder", newColumnOrder);
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while adding column in board ${request.params.boardId}: ${err}`
    );
    throw `Error while adding column in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("removeColumn", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columnOrder = board
      .get("columnOrder")
      .filter((id) => id !== request.params.columnId);
    var columns = board.get("columns");
    // delete columns[request.params.columnId];
    board.set("columnOrder", columnOrder);
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while removing column in board ${request.params.boardId}: ${err}`
    );
    throw `Error while removing column in board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("updateBoard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set("name", request.params.name);
    board.set("defaultPayment", request.params.defaultPayment);
    board.set("tokenGating", request.params.tokenGating);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating board ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("deleteBoard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board && (await board.destroy());
    return true;
  } catch (err) {
    logger.error(
      `Error while deleting board ${request.params.boardId}: ${err}`
    );
    throw `Error while deleting board ${request.params.boardId}: ${err}`;
  }
});

Moralis.Cloud.define("updateBoardMembers", async (request) => {
  try {
    const boardQuery = new Moralis.Query("Board");
    boardQuery.equalTo("objectId", request.params.boardId);
    const board = await boardQuery.first();
    board.set("members", request.params.members);
    board.set("roles", request.params.roles);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating board members on board id ${request.params.boardId}: ${err}`
    );
    throw `Error while updating board members ${err}`;
  }
});

Moralis.Cloud.define("joinSpace", async (request) => {
  try {
    const boardQuery = new Moralis.Query("Board");
    boardQuery.equalTo("objectId", request.params.boardId);
    let board = await boardQuery.first();
    if (board.get("members").indexOf(request.user.id) !== -1) {
      return false; // replace with throw maybe?
    }
    if (
      !(
        board.get("tokenGating").tokenAddress &&
        board.get("tokenGating").tokenLimit > 0
      )
    ) {
      return false; // replace with throw maybe?
    }
    let tribe = await getTribeByTeamId(board.get("teamId")); // need to change to objectid
    const options = {
      chain: board.get("tokenGating").chain.name,
      address: request.user.get("ethAddress"),
    };
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    const token = balances.filter(
      (b) =>
        b.token_address.toLowerCase() ===
        board.get("tokenGating").tokenAddress.toLowerCase()
    );
    logger.info(`token ${JSON.stringify(token)}`);
    const web3 = Moralis.web3ByChain("0x1");
    if (
      token[0] &&
      web3.utils.fromWei(token[0].balance.toString()) >=
        board.get("tokenGating").tokenLimit
    ) {
      if (tribe.get("members").indexOf(request.user.id) === -1) {
        tribe = joinTribeAsMember(tribe, request.user.id);
      }
      board = joinSpaceAsMember(board, request.user.id);
      await Moralis.Object.saveAll([tribe, board], { useMasterKey: true });
      const boardObj = await getBoardObjWithTasksByObjectId(
        request.params.boardId,
        request.user.id
      );
      return boardObj[0];
    } else {
      throw "Not enough balance to join this space";
    }
  } catch (err) {
    logger.error(
      `Error while joining space with space id ${request.params.boardId} : ${err}`
    );
    throw `Error while joining space ${err}`;
  }
});
