async function getTaskObjByTaskId(taskId) {
  const epochQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }];
  return await epochQuery.aggregate(pipeline);
}

Moralis.Cloud.define("addTask", async (request) => {
  try {
    const board = await getBoardByObjectId(request.params.boardId);
    var columns = board.get("columns");
    var tasks = board.get("tasks");
    const logger = Moralis.Cloud.getLogger();

    const taskId = `task-${request.params.boardId}-${Object.keys(tasks).length}`;
    tasks[taskId] = {
      taskId: taskId,
      title: request.params.title,
      reward: request.params.reward,
    };
    var taskIds = columns[request.params.columnId].taskIds;
    columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
    board.set("columns", columns);
    board.set("tasks", tasks);

    var taskObj = new Moralis.Object("Task");
    //TODO: default chain and token should be fetched from teams data
    var reward = {
      chain: "polygon",
      token: "Matic",
      value: request.params.reward,
    };
    taskObj.set("taskId", taskId);
    taskObj.set("title", request.params.title);
    taskObj.set("reward", reward);
    taskObj.set("description", request.params.description);
    await Moralis.Object.saveAll([board, taskObj], { useMasterKey: true });
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getTask", async (request) => {
  try {
    if (request.params.taskId) {
      const task = await getTaskObjByTaskId(request.params.taskId);
      if (task.length === 0) throw `Task ${request.params.taskId} not found`;
      return task[0];
    }
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const taskQuery = new Moralis.Query("Task");
  try {
    logger.info(JSON.stringify(request.params));
    taskQuery.equalTo("objectId", request.params.id);
    const task = await taskQuery.first();
    logger.info(JSON.stringify(task));
    task.set("status", request.params.status);
    if (request.params.status === 101) {
      task.set("assignee", request.user.id);
    }
    if (request.params.status === 102) {
      task.set("paid", request.params.paid);
    }
    task.save({
      useMasterKey: true,
    });
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
});
