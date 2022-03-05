async function getTaskByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("taskId", taskId);
  return await taskQuery.first();
}

async function getTaskObjByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }, { limit: 1 }];
  const task = await taskQuery.aggregate(pipeline);
  return task.length > 0 ? task[0] : null;
}

async function getTaskObjByBoardId(boardId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [
    { match: { boardId: boardId } },
    {
      project: {
        description: 0,
        submission: 0,
        activity: 0,
        chain: 0,
      },
    },
  ];
  return await taskQuery.aggregate(pipeline);
}

async function getTaskCountInBoard(boardId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("boardId", boardId);
  return await taskQuery.count();
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
      if (!task) throw `Task ${request.params.taskId} not found`;

      // Get all board members so they can be displayed as options for reviewers and assignees
      const board = await getBoardObjByObjectId(task.boardId, request.user.id);
      logger.info(`board ${JSON.stringify(board)}`);

      // Get access level of caller
      const access = getFieldLevelAccess(task, request.user.id);
      task.access = access;
      logger.info(`access ${JSON.stringify(access)}`);

      return task;
    }
  } catch (err) {
    logger.error(
      `Error while getting task from board ${request.params.taskId}: ${err}`
    );
    throw `Error while getting task from board ${request.params.taskId}: ${err}`;
  }
});

Moralis.Cloud.define("addTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  const board = await getBoardByObjectId(request.params.boardId);
  try {
    const team = await getTribeByTeamId(board.get("teamId"));
    if (isMember(request.user.id, board)) {
      var columns = board.get("columns");
      const numTasks = await getTaskCountInBoard(request.params.boardId);
      const taskId = `task-${request.params.boardId}-${numTasks + 1}`;
      var taskIds = columns[request.params.columnId].taskIds;
      columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
      board.set("columns", columns);

      var task = new Moralis.Object("Task");
      task.set("taskId", taskId);
      task.set("token", {
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "WMatic",
      }); //TODO: remove hardcoded value
      task.set("chain", {
        chainId: "80001",
        name: "mumbai",
      }); //TODO: remove hardcoded value
      task.set("boardId", request.params.boardId);
      task.set("title", request.params.title);
      task.set("value", parseFloat(request.params.value));
      task.set("creator", request.user.id);
      task.set("reviewer", [request.user.id]);
      task.set("assignee", []);
      task.set("description", request.params.description);
      task.set("activity", [
        {
          actor: request.user.id,
          action: 100,
          timestamp: new Date(),
        },
      ]);
      task.set("issueLink", request.params.issueLink);
      task.set("status", 100);

      await Moralis.Object.saveAll([task], { useMasterKey: true });
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      const boardObj = await getBoardObjWithTasksByObjectId(
        request.params.boardId,
        request.user.id
      );
      return boardObj[0];
    } else {
      throw "User doesnt have access to create task";
    }
  } catch (err) {
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
    const boardObj = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return boardObj[0];
  }
});

Moralis.Cloud.define("updateTaskStatus", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    await handleStatusChange(
      request.params.boardId,
      request.params.taskId,
      request.params.status,
      request.params.columnId
    );
    logger.info(
      `Handled status field for task with id ${JSON.stringify(
        request.params.task?.taskId
      )}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      request.params.boardId,
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
  }
});

Moralis.Cloud.define("updateTaskDeadline", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleDeadlineUpdate(task, request.user.id, request.params.deadline);
    logger.info(
      `Handled deadline field for task with id ${JSON.stringify(
        request.params.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskLabels", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleTagUpdate(task, request.user.id, request.params.tags);
    logger.info(
      `Handled tag field for task with id ${JSON.stringify(
        request.params.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskMember", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    if (request.params.type === "assignee") {
      task = handleAssigneeUpdate(task, request.user.id, request.params.member);
      task = handleActivityUpdate(task, request.user.id, 105);
      logger.info(
        `Handled assignee field for task with id ${JSON.stringify(
          request.params.taskId
        )}`
      );
    }
    if (request.params.type === "reviewer") {
      task = handleReviewerUpdate(task, request.user.id, request.params.member);
      logger.info(
        `Handled reviewer field for task with id ${JSON.stringify(
          request.params.taskId
        )}`
      );
    }
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskReward", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleRewardUpdate(
      task,
      request.user.id,
      request.params.value,
      request.params.token,
      request.params.chain.name
    );
    logger.info(
      `Handled reward field for task with id ${JSON.stringify(
        request.params.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskSubmission", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleSubmissionUpdate(
      task,
      request.user.id,
      request.params.submissionLink,
      request.params.submissionName
    );
    handleActivityUpdate(task, request.user.id, 200);
    task.set("status", 200);
    logger.info(
      `Handled submission field for task with id ${JSON.stringify(
        request.params.task?.taskId
      )}`
    );

    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskDescription", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleDescriptionUpdate(
      task,
      request.user.id,
      request.params.description
    );
    logger.info(
      `Handled description field for task with id ${JSON.stringify(
        request.params.task?.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

Moralis.Cloud.define("updateTaskTitle", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleTitleUpdate(task, request.user.id, request.params.title);
    logger.info(
      `Handled title field for task with id ${JSON.stringify(
        request.params.task?.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while updating task with task Id ${request.params.taskId}: ${err}`
    );
    const board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});

function handleTitleUpdate(task, userId, title) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    title.length && task.set("title", title);
  }
  return task;
}

function handleDescriptionUpdate(task, userId, description) {
  // if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
  task.set("description", description);
  // }
  return task;
}

function handleRewardUpdate(task, userId, value, token, chain) {
  if (
    isTaskCreator(task, userId) &&
    value > 0 &&
    ["wmatic", "weth", "usdc"].includes(token.toLowerCase()) &&
    ["polygon", "ethereum"].includes(chain.toLowerCase())
  ) {
    task.set("value", parseFloat(value));
    task.set("token", token);
    task.set("chain", chain);
  }
  return task;
}

function handleTagUpdate(task, userId, tags) {
  if (
    isTaskCreator(task, userId) ||
    isTaskReviewer(task, userId) ||
    isTaskAssignee(task, userId)
  ) {
    task.set("tags", tags);
  }
  return task;
}

function handleDeadlineUpdate(task, userId, deadline) {
  // if (isTaskCreator(task, userId) && deadline) {
  task.set("deadline", new Date(deadline));
  // }
  return task;
}

function handleAssigneeUpdate(task, callerId, assigneeId) {
  if (assigneeId) {
    // && isDifferentAssignee(task.get("assignee"), assignee))
    task.set("assignee", [assigneeId]);
  }
  return task;
}

function handleReviewerUpdate(task, callerId, reviewerId) {
  if (isTaskCreator(task, callerId) || isTaskReviewer(task, callerId)) {
    logger.info(`dadadadad`);

    reviewerId && task.set("reviewer", [reviewerId]);
  }
  return task;
}

function handleSubmissionUpdate(task, userId, link, name) {
  // if (isTaskAssignee(task, userId)) {
  task.set("submission", { link: link, name: name });
  // }
  return task;
}

function handleActivityUpdate(task, userId, action) {
  task.set("activity", [
    { actor: userId, action: action, timestamp: new Date() },
    ...task.get("activity"),
  ]);
  return task;
}

async function handleStatusChange(boardId, taskId, status, currentColumnId) {
  const logger = Moralis.Cloud.getLogger();
  try {
    const board = await getBoardByObjectId(boardId);
    var columnsData = board.get("columns");
    const currentColumn = columnsData[currentColumnId];
    const index = currentColumn.taskIds.indexOf(taskId);
    logger.info(`index ${index}`);
    logger.info(`current column ${JSON.stringify(currentColumn)}`);
    const startTaskIds = Array.from(currentColumn.taskIds); // copy
    startTaskIds.splice(index, 1);
    logger.info(`${startTaskIds} startTaskIds`);
    const newStart = {
      ...currentColumn,
      taskIds: startTaskIds,
    };
    const statusIndex = board.get("statusList").indexOf(status);
    const newColumn = columnsData[`column-${statusIndex}`]; // temporary solution, will break if we change column ids in the future
    logger.info(`new column ${JSON.stringify(newColumn)}`);
    const finishTaskIds = Array.from(newColumn.taskIds); // copy
    finishTaskIds.splice(newColumn.taskIds.length, 0, taskId);
    const newFinish = {
      ...newColumn,
      taskIds: finishTaskIds,
    };

    columnsData = {
      ...columnsData,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    };
    logger.info(`columns data ${JSON.stringify(columnsData)}`);
    board.set("columns", columnsData);
    await Moralis.Object.saveAll([board], { useMasterKey: true });

    // task.set("status", getStatusCode(status));
    // return task;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

Moralis.Cloud.define("getBatchPayAmount", async (request) => {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [
    {
      match: {
        boardId: request.params.boardId,
        status: 205,
        value: { $gt: 0 },
        $expr: {
          $eq: ["$chain.chainId", request.params.chainId],
        },
      },
    },
    {
      group: {
        objectId: {
          tokenAddress: "$token.address",
          assigneeId: "$assignee",
        },
        value: { $sum: "$value" },
      },
    },
  ];
  const tasks = await taskQuery.aggregate(pipeline);
  logger.info(`tyasks ${JSON.stringify(tasks)}`);

  var paymentAmount = {};
  logger.info(`tyasks2 ${JSON.stringify(paymentAmount)}`);
  for (var task of tasks) {
    if (!(task["objectId"] in paymentAmount)) {
      paymentAmount = {
        tokenAddresses: [],
        contributors: [],
        tokenValues: [],
      };
    }
    paymentAmount["tokenAddresses"].push(task["objectId"]["tokenAddress"]);
    paymentAmount["contributors"].push(task["objectId"]["assigneeId"][0]);
    paymentAmount["tokenValues"].push(task["value"]);
  }
  logger.info(`tasks ${JSON.stringify(tasks)}`);

  return paymentAmount;
});

Moralis.Cloud.define("assignToMe", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    var board = await getBoardByObjectId(task.get("boardId"));
    if (isMember(request.user.id, board)) {
      task = handleAssigneeUpdate(task, request.user.id, request.user.id);
      task = handleActivityUpdate(task, request.user.id, 105);
      task.set("status", 105);
      await Moralis.Object.saveAll(task, { useMasterKey: true });
      board = await getBoardObjWithTasksByObjectId(
        task.get("boardId"),
        request.user.id
      );
      return board[0];
    }
  } catch (err) {
    logger.error(`Error while assigning task ${request.params.taskId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("closeTask", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    if (
      isTaskCreator(task, request.user.id) ||
      isTaskReviewer(task, request.user.id)
    ) {
      task = handleStatusChange(task, request.user.id, "Closed");
      task = handleActivityUpdate(task, request.user.id, 205);
      task.set("status", 205);
      await Moralis.Object.saveAll(task, { useMasterKey: true });
      var board = await getBoardObjWithTasksByObjectId(
        task.get("boardId"),
        request.user.id
      );
      return board[0];
    }
  } catch (err) {
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
    var board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  }
});
