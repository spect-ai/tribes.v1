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
  const boardObj = await getBoardObjWithTasksByObjectId(
    request.params.boardId,
    request.user.id
  );
  if (boardObj.length === 0) throw "Board not found";
  boardObj[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
    boardObj[0].members
  );
  return boardObj[0];
});

Moralis.Cloud.define("getBoards", async (request) => {
  return await getBoardObjByTeamId(request.params.teamId);
});

Moralis.Cloud.define("initBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const team = await getTribeByTeamId(request.params.teamId);
    logger.info(JSON.stringify(team));
    if (isMember(request.user.id, team)) {
      var initColumns = ["To Do", "In Progress", "In Review", "Done"];
      var initBoardStatusList = ["Open", "In Progress", "Submitted", "Closed"];
      var initStatusColors = ["#eaeaea", "#0061ff", "#2e5da9", "#5fe086"];
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
          color: initStatusColors[i],
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

      logger.error(`Creating new board ${JSON.stringify(board)}`);

      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return board;
    } else {
      logger.info(`User ${request.user.id} is not a member of the tribe`);
      throw `User ${request.user.id} is not a member of the tribe`;
    }
  } catch (err) {
    logger.error(`Error while creating board ${err}`);
    throw `${err}`;
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
    return false;
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
      `Error while updating column name in board ${request.params.boardId}: ${err}`
    );
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
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
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
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
      `Error while adding column order in board ${request.params.boardId}: ${err}`
    );
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
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
      `Error while removing column order in board ${request.params.boardId}: ${err}`
    );
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  }
});

Moralis.Cloud.define("updateBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoardByObjectId(request.params.boardId);
    board.set("name", request.params.name);
    board.set("columns", request.params.columns);
    board.set("statusList", request.params.statusList);
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
    return false;
  }
});

Moralis.Cloud.define("deleteBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoardByObjectId(request.params.boardId);
    board && (await board.destroy());
    return true;
  } catch (err) {
    logger.error(
      `Error while deleting board ${request.params.boardId}: ${err}`
    );
    return false;
  }
});

Moralis.Cloud.define("addBoardMembers", async (request) => {
  const boardQuery = new Moralis.Query("Board");
  boardQuery.equalTo("objectId", request.params.boardId);
  const board = await boardQuery.first();
  board.set("members", board.get("members").concat(request.params.members));
  await Moralis.Object.saveAll([board], { useMasterKey: true });
});
