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
    if (isMember(request.user.get("ethAddress"), team)) {
      var initColumns = ["To Do", "In Progress", "In Review", "Done"];
      var columnIds = [];
      var columnIdToColumnMap = {};

      for (let i = 0; i < 4; i++) {
        columnIds.push(generateUniqueIdByDatetimeAndNumber(i));
        columnIdToColumnMap[columnIds[i]] = { id: columnIds[i], title: initColumns[i], tasks: [] };
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
      logger.info(`User ${request.user.get("ethAddress")} is not a member of the tribe`);
      throw 'User ${request.user.get("ethAddress")} is not a member of the tribe';
    }
  } catch (err) {
    logger.error(`Error while creating board ${err}`);
    return false;
  }
});

async function getBoard(
  name,
  description,
  teamId,
  strategy,
  settlementTokenName,
  settlementTokenAddress,
  settlementTokenType,
  bumpUpValue,
  dumpDownValue,
  bumpUpTillPause,
  dumpDownTillPause,
  update = false
) {
  var board = new Moralis.Object("Board");
  board.set("name", name);
  board.set("description", description);
  if (!update) {
    board.set("teamId", teamId);
  }
  board.set("strategy", strategy);
  board.set("settlementTokenName", settlementTokenName);
  board.set("settlementTokenAddress", settlementTokenAddress);
  board.set("settlementTokenType", settlementTokenType);
  board.set("bumpUpValue", bumpUpValue);
  board.set("dumpDownValue", dumpDownValue);
  board.set("bumpUpTillPause", bumpUpTillPause);
  board.set("dumpDownTillPause", dumpDownTillPause);

  return board;
}

Moralis.Cloud.define("createBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoard(
      request.params.name,
      request.params.description,
      request.params.teamId,
      request.params.strategy,
      request.params.settlementTokenName,
      request.params.settlementTokenAddress,
      request.params.settlementTokenType,
      request.params.bumpUpValue,
      request.params.dumpDownValue,
      request.params.bumpUpTillPause,
      request.params.dumpDownTillPause,
      (update = false)
    );
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return board;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateBoard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTeam(request.params.teamId);
    const canUpdate = await hasAccess(request.params.ethAddress, team, (requiredAccess = "admin"));
    if (canUpdate) {
      const board = await getBoard(
        request.params.name,
        request.params.description,
        request.params.teamId,
        request.params.strategy,
        request.params.settlementTokenName,
        request.params.settlementTokenAddress,
        request.params.settlementTokenType,
        request.params.bumpUpValue,
        request.params.dumpDownValue,
        request.params.bumpUpTillPause,
        request.params.dumpDownTillPause,
        (update = true)
      );
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return board;
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});
