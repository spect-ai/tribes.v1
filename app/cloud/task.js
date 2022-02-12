async function getTaskByTaskId(taskId) {
  const epochQuery = new Moralis.Query("Task");
  epochQuery.equalTo("taskId", taskId);
  return await epochQuery.first();
}

async function getTaskObjByTaskId(taskId) {
  const epochQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }];
  return await epochQuery.aggregate(pipeline);
}

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
      token: "Matic",
      deadline: request.params.deadline,
      latestActor: request.user.username,
      latestActionTime: new Date(),
      activeStatus: 100,
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
    taskObj.set("creator", request.user.id);
    taskObj.set("reviewer", request.user.id);
    taskObj.set("status", 100);
    taskObj.set("activity", {
      latestActor: request.user.get("username"),
      latestActionTime: new Date(),
      statusChange: 500,
    });

    await Moralis.Object.saveAll([board, taskObj], { useMasterKey: true });
    const boardObj = await getBoardObjByObjectId(request.params.boardId);
    return boardObj[0];
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.task?.taskId);

  try {
    if (hasAccessToEditTask(request.user.id, task)) {
      task = handleTitleUpdate(task, request.user.id, request.params.task.title);
      task = handleDescriptionUpdate(task, request.user.id, request.params.task.description);
      task = handleRewardUpdate(
        task,
        request.user.id,
        request.params.task.reward,
        request.params.task.token,
        request.params.task.chain
      );
      task = handleTagUpdate(task, request.user.id, request.params.task.tags);
      task = handleDueDateUpdate(task, request.user.id, request.params.task.dueDate);
      task = handleAssigneeUpdate(task, request.user.id, request.params.task.assignee);
      task = handleReviewerUpdate(task, request.user.id, request.params.task.reviewer);
      task = handleSubmissionUpdate(task, request.user.id, request.params.task.submission);
      logger.info(`Updating task ${JSON.stringify(task)}`);

      await Moralis.Object.saveAll([task], { useMasterKey: true });
      return task;
    } else {
      throw "User doesnt have access to update task";
    }
  } catch (err) {
    logger.error(`Error while updating task ${request.params.task.taskId}: ${err}`);
    return task;
  }
});

function handleTitleUpdate(task, userId, title) {
  if (isTaskClient(task, userId) && title.length > 0) {
    task.set("title", title);
    return task;
  }
}

function handleDescriptionUpdate(task, userId, description) {
  if (isTaskClient(task, userId)) {
    task.set("description", description);
    return task;
  }
}

function handleRewardUpdate(task, userId, reward, token, chain) {
  if (
    isTaskClient(task, userId) &&
    task.get("status") === 100 &&
    reward > 0 &&
    ["matic", "eth", "usdc"].includes(token.toLowerCase()) &&
    ["polygon", "ethereum", "bsc"].includes(chain.toLowerCase())
  ) {
    task.set("reward", { chain: chain, token: token, reward: reward });
    return task;
  }
}

function handleTagUpdate(task, userId, tags) {
  if (isTaskClient(task, userId)) {
    task.set("tags", tags);
    return task;
  }
}

function handleDueDateUpdate(task, userId, dueDate) {
  if (isTaskClient(task, userId) && dueDate) {
    task.set("dueDate", new Date(parseInt(dueDate)));
    return task;
  }
}

function handleAssigneeUpdate(task, userId, assignee) {
  if (isTaskClient(task, userId) || (isTaskAssignee(task, userId) && !assignee)) {
    task.set("assignee", assignee);
    return task;
  }
}

function handleReviewerUpdate(task, userId, reviewer) {
  if (isTaskClient(task, userId)) {
    task.set("reviewer", reviewer);
    return task;
  }
}

function handleSubmissionUpdate(task, userId, submission) {
  if (isTaskAssignee(task, userId)) {
    task.set("submission", submission);
    return task;
  }
}

/*
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
});*/
