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
