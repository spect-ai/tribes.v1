Moralis.Cloud.define("addTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  const board = await getBoardByObjectId(request.params.boardId);
  try {
    if (isMember(request.user.id, board)) {
      var columns = board.get("columns");
      const numTasks = await getTaskCountInBoard(request.params.boardId);
      const taskId = `task-${request.params.boardId}-${numTasks + 1}`;
      var taskIds = columns[request.params.columnId].taskIds;
      columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
      board.set("columns", columns);
      const defaultPayment = board.get("defaultPayment");
      logger.info(`defaultPayment ${JSON.stringify(defaultPayment)}`);
      var task = new Moralis.Object("Task");
      task = handleCreateTask(
        task,
        taskId,
        defaultPayment,
        request.params.boardId,
        request.params.title,
        request.params.value,
        request.user.id,
        columns[request.params.columnId].defaultCardType
      );
      logger.info(`Creating task ${JSON.stringify(task)}`);
      // await Moralis.Object.saveAll([task], { useMasterKey: true }); why save separately??
      await Moralis.Object.saveAll([board, task], { useMasterKey: true });
      const res = {};
      const space = await getSpace(request.params.boardId, request.user.id);
      res.space = space;
      res.taskId = taskId;
      return res;
    } else {
      throw "User doesnt have access to create task";
    }
  } catch (err) {
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
    throw `Error while adding task ${err}`;
  }
});
