async function getBoardByObjectId(objectId) {
  const boardQuery = new Moralis.Query("Board");
  boardQuery.equalTo("objectId", objectId);
  return await boardQuery.first();
}

async function getBoardObjByObjectId(objectId) {
  const boardQuery = new Moralis.Query("Board");
  const pipeline = [{ match: { objectId: objectId } }];
  return await boardQuery.aggregate(pipeline);
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
  const boardObj = await getBoardObjByObjectId(request.params.boardId);
  if (boardObj.length === 0) throw "Board not found";
  return boardObj[0];
});

Moralis.Cloud.define("getBoards", async (request) => {
  return await getBoardObjByTeamId(request.params.teamId);
});

Moralis.Cloud.define("initBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const team = await getTribeByTeamId(request.params.teamId);
    if (isMember(request.user.id, team)) {
      var initColumns = ["To Do", "In Progress", "In Review", "Done"];
      var columnIds = [];
      var columnIdToColumnMap = {};

      for (let i = 0; i < 4; i++) {
        var columnId = `column-${i}`;
        columnIds.push(columnId);
        columnIdToColumnMap[columnIds[i]] = {
          id: columnId,
          title: initColumns[i],
          taskIds: [],
        };
        logger.info(`${JSON.stringify(columnIdToColumnMap)}`);
      }
      var board = new Moralis.Object("Board");
      board.set("name", request.params.name);
      board.set("teamId", parseInt(request.params.teamId));
      board.set("tasks", {});
      board.set("columns", columnIdToColumnMap);
      board.set("columnOrder", columnIds);

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
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoardByObjectId(request.params.boardId);
    var columns = board.get("columns");
    columns[request.params.columnId]["title"] = request.params.newName;
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
  } catch (err) {
    logger.error(`Error while updating column name in board ${request.params.boardId}: ${err}`);
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
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while updating column name in board ${request.params.boardId}: ${err}`);
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  }
});

Moralis.Cloud.define("updateColumnOrder", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    board.set("columnOrder", request.params.newColumnOrder);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while updating column order in board ${request.params.boardId}: ${err}`);
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  }
});

Moralis.Cloud.define("addColumn", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columnOrder = board.get("columnOrder");
    var columns = board.get("columns");

    const columnId = `column-${columnOrder.length}`;
    const newColumnOrder = [...columnOrder, columnId];
    columns[columnId] = { id: columnId, title: "", taskIds: [] };

    board.set("columnOrder", newColumnOrder);
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while adding column order in board ${request.params.boardId}: ${err}`);
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  }
});

Moralis.Cloud.define("removeColumn", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columnOrder = board.get("columnOrder").filter((id) => id !== request.params.columnId);
    var columns = board.get("columns");
    delete columns[request.params.columnId];
    board.set("columnOrder", columnOrder);
    board.set("columns", columns);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while removing column order in board ${request.params.boardId}: ${err}`);
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  }
});
