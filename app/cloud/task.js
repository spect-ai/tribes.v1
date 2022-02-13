async function getTaskByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("taskId", taskId);
  return await taskQuery.first();
}

async function getTaskObjByTaskId(taskId) {
  const epochQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }];
  return await epochQuery.aggregate(pipeline);
}

function getTaskObjByTaskParseObj(task) {
  return {
    objectId: task.id,
    taskId: task.get("taskId"),
    title: task.get("title"),
    description: task.get("description"),
    submission: task.get("submission"),
    deadline: task.get("deadline"),
    tags: task.get("tags"),
    assignee: task.get("assignee"),
    reviewer: task.get("reviewer"),
    creator: task.get("creator"),
    chain: task.get("chain"),
    value: task.get("value"),
    token: task.get("token"),
    activity: task.get("activity"),
    status: task.get("status"),
  };
}

Moralis.Cloud.define("getTask", async (request) => {
  try {
    if (request.params.taskId) {
      const task = await getTaskObjByTaskId(request.params.taskId);
      if (task.length === 0) throw `Task ${request.params.taskId} not found`;
      for (var act of task[0].activity) {
        var userQuery = new Moralis.Query("User");
        userQuery.equalTo("objectId", act.actor);
        var user = await userQuery.first({ useMasterKey: true });
        act.username = user.get("username");
        act.profilePicture = user.get("profilePicture");
      }
      return task[0];
    }
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("addTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  const board = await getBoardByObjectId(request.params.boardId);
  const boardToReturnInFailure = board;
  try {
    const team = await getTribeByTeamId(board.get("teamId"));
    if (isMember(request.user.id, team)) {
      var columns = board.get("columns");
      var tasks = board.get("tasks");
      const taskId = `task-${request.params.boardId}-${Object.keys(tasks).length}`;
      tasks[taskId] = {
        taskId: taskId,
        title: request.params.title,
        value: request.params.value,
        token: "Matic",
        deadline: request.params.deadline,
        latestActor: request.user.get("username"),
        latestActionTime: new Date(),
        activeStatus: 100,
      };
      var taskIds = columns[request.params.columnId].taskIds;
      columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
      board.set("columns", columns);
      board.set("tasks", tasks);

      var taskObj = new Moralis.Object("Task");
      taskObj.set("taskId", taskId);
      taskObj.set("boardId", request.params.boardId);
      taskObj.set("title", request.params.title);
      taskObj.set("chain", team.get("preferredChain"));
      taskObj.set("token", team.get("preferredToken"));
      taskObj.set("value", request.params.value);
      taskObj.set("creator", request.user.id);
      taskObj.set("reviewer", request.user.id);
      taskObj.set("status", 100);
      taskObj.set("description", request.params.description);
      taskObj.set("activity", [
        {
          actor: request.user.id,
          action: 1,
          timestamp: new Date(),
        },
      ]);

      await Moralis.Object.saveAll([board, taskObj], { useMasterKey: true });
      return getBoardObjFromBoardParseObj(board);
    } else {
      throw "User doesnt have access to create task";
    }
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return getBoardObjFromBoardParseObj(boardToReturnInFailure);
  }
});

Moralis.Cloud.define("updateTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.task?.taskId);
  var board = await getBoardByObjectId(task.get("boardId"));

  try {
    [task, board] = handleTitleUpdate(task, board, request.user.id, request.params.task.title);

    task = handleDescriptionUpdate(task, request.user.id, request.params.task.description);
    [task, board] = handleRewardUpdate(
      task,
      board,
      request.user.id,
      request.params.task.value,
      request.params.task.token,
      request.params.task.chain
    );
    task = handleTagUpdate(task, request.user.id, request.params.task.tags);
    task = handleDeadlineUpdate(task, request.user.id, request.params.task.deadline);
    [task, board] = handleAssigneeUpdate(task, board, request.user.id, request.params.task.assignee);
    task = handleReviewerUpdate(task, request.user.id, request.params.task.reviewer);
    [task, board] = handleSubmissionUpdate(task, board, request.user.id, request.params.task.submission);

    logger.info(`Updating task ${JSON.stringify(task)}`);
    logger.info(`Updating board ${JSON.stringify(board)}`);

    await Moralis.Object.saveAll([task, board], { useMasterKey: true });
    logger.info(`Updating task ${JSON.stringify(task)}`);

    return [getBoardObjFromBoardParseObj(board), getTaskObjByTaskParseObj(task)];
  } catch (err) {
    logger.error(`Error while updating task with task Id ${request.params.task?.taskId}: ${err}`);
    return [getBoardObjFromBoardParseObj(board), getTaskObjByTaskParseObj(task)];
  }
});

function handleTitleUpdate(task, board, userId, title) {
  if (isTaskClient(task, userId) && title.length > 0) {
    var boardTasks = board.get("tasks");
    boardTasks[task.get("taskId")]["title"] = title;
    board.set("tasks", boardTasks);
    task.set("title", title);
  }
  return [task, board];
}

function handleDescriptionUpdate(task, userId, description) {
  if (isTaskClient(task, userId)) {
    task.set("description", description);
  }
  return task;
}

function handleRewardUpdate(task, board, userId, value, token, chain) {
  if (
    isTaskClient(task, userId) &&
    value > 0 &&
    ["wmatic", "weth", "usdc"].includes(token.toLowerCase()) &&
    ["polygon", "ethereum"].includes(chain.toLowerCase())
  ) {
    var boardTasks = board.get("tasks");
    boardTasks[task.get("taskId")]["value"] = parseInt(value);
    boardTasks[task.get("taskId")]["token"] = token;
    board.set("tasks", boardTasks);
    task.set("value", parseInt(value));
    task.set("token", token);
    task.set("chain", chain);
  }
  return [task, board];
}

function handleTagUpdate(task, userId, tags) {
  if (isTaskClient(task, userId)) {
    task.set("tags", tags);
  }
  return task;
}

function handleDeadlineUpdate(task, userId, deadline) {
  if (isTaskClient(task, userId) && deadline) {
    task.set("deadline", new Date(deadline));
  }
  return task;
}

function handleAssigneeUpdate(task, board, userId, assignee) {
  if ((isTaskClient(task, userId) && assignee) || (isTaskAssignee(task, userId) && !assignee)) {
    if (task.get("assignee") !== assignee) {
      [task, board] = handleActivityUpdate(task, board, userId, 105, 5);
      task.set("assignee", assignee);
    }
  }
  return [task, board];
}

function handleReviewerUpdate(task, userId, reviewer) {
  if (isTaskClient(task, userId)) {
    task.set("reviewer", reviewer);
  }
  return task;
}

function handleSubmissionUpdate(task, board, userId, submission) {
  if ((submission || task.get("submission")) && isTaskAssignee(task, userId) && task.get("submission") !== submission) {
    [task, board] = handleActivityUpdate(task, board, userId, 200, 10);
    task.set("submission", submission);
  }
  return [task, board];
}

function handleActivityUpdate(task, board, userId, status, action) {
  var boardTasks = board.get("tasks");
  boardTasks[task.get("taskId")]["status"] = status;
  board.set("tasks", boardTasks);
  logger.info(`boardTasks ${JSON.stringify(boardTasks)}`);
  logger.info(`board ${JSON.stringify(board)}`);

  task.set("status", status);
  task.set("activity", [...task.get("activity"), { actor: userId, action: action, timestamp: new Date() }]);
  return [task, board];
}

Moralis.Cloud.define("closeTask", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    var board = await getBoardByObjectId(task.get("boardId"));
    [task, board] = handleActivityUpdate(task, board, request.user.id, 205, 15);
    return getBoardObjFromBoardParseObj(board);
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("distributeTaskReward", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    var board = await getBoardByObjectId(task.get("boardId"));
    [task, board] = handleActivityUpdate(task, board, request.user.id, 300, 20);
    return getBoardObjFromBoardParseObj(board);
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

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
