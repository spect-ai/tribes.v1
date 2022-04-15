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
      const defaultPayment =
        request.params.token && request.params.chain
          ? { chain: request.params.chain, token: request.params.token }
          : board.get("defaultPayment");
      var task = new Moralis.Object("Task");
      task = handleCreateTask(
        task,
        taskId,
        defaultPayment,
        request.params.boardId,
        request.params.title,
        request.params.value,
        request.user.id,
        request.params.type
          ? request.params.type
          : columns[request.params.columnId].defaultCardType,
        request.params.columnId,
        request.params.tags,
        request.params.description,
        request.params.assignee,
        request.params.deadline
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

function handleCreateTask(
  task,
  taskId,
  defaultPayment,
  boardId,
  title,
  value,
  userId,
  cardType,
  columnId,
  tags,
  description,
  assignee,
  deadline
) {
  task.set("taskId", taskId);
  task.set("token", {
    address: defaultPayment?.token?.address,
    symbol: defaultPayment?.token?.symbol,
  });
  task.set("chain", {
    chainId: defaultPayment?.chain?.chainId,
    name: defaultPayment?.chain?.name,
  });
  task.set("boardId", boardId);
  task.set("title", title);
  task.set("value", parseFloat(value));
  task.set("creator", userId);
  task.set("reviewer", [userId]);
  assignee ? task.set("assignee", assignee) : task.set("assignee", []);
  task.set("status", 100);
  tags ? task.set("tags", tags) : task.set("tags", []);
  if (description) task.set("description", description);
  task.set("columnId", columnId);
  task.set("status", 100);
  cardType ? task.set("type", cardType) : task.set("type", "Task");
  if (deadline) task.set("deadline", new Date(deadline));
  task.set("activity", [
    {
      action: 100,
      actor: userId,
      timestamp: new Date(),
      taskType: cardType ? cardType : "Task",
      changeLog: { prev: null, next: cardType ? cardType : "Task" },
    },
  ]);
  return task;
}
