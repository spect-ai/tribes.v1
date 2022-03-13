async function getTaskByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("taskId", taskId);
  return await taskQuery.first();
}

async function getTasksByTaskIds(taskIds) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.containedIn("taskId", taskIds);
  return await taskQuery.find();
}
async function getTaskObjsByTaskIds(taskIds) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: { $in: taskIds } } }];
  const tasks = await taskQuery.aggregate(pipeline);
  return tasks;
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
    {
      match: {
        boardId: boardId,
        status: { $ne: 400 },
      },
    },
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
      const board = await getBoardObjByObjectId(task.boardId, request.user?.id);
      logger.info(`board ${JSON.stringify(board)}`);

      // Get access level of caller
      const access = getFieldLevelAccess(task, request.user?.id);
      task.access = access;
      logger.info(`access ${JSON.stringify(access)}`);

      return task;
    }
  } catch (err) {
    logger.error(
      `Error while getting task from board ${request.params.taskId}: ${err}`
    );
    throw `Error while getting task ${err}`;
  }
});

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
      var task = new Moralis.Object("Task");
      task.set("taskId", taskId);
      task.set("token", {
        address: defaultPayment?.token?.address || "0x0",
        symbol: defaultPayment?.token?.symbol,
      });
      task.set("chain", {
        chainId: defaultPayment?.chain?.chainId || "137",
        name: defaultPayment?.chain?.name || "polygon",
      });
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
    throw `Error while adding task ${err}`;
  }
});

Moralis.Cloud.define("updateTaskColumn", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    await handleColumnChange(
      request.params.boardId,
      request.params.taskId,
      request.params.sourceId,
      request.params.destinationId
    );
    logger.info(
      `Handled column field for task with id ${JSON.stringify(
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
      `Error while updating task column with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task column ${err}`;
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
      `Error while updating task deadline with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task deadline ${err}`;
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
      `Error while updating task label with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task label ${err}`;
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
      `Error while updating task members with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task members ${err}`;
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
      request.params.chain,
      request.params.nativeCurrencyPayment
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
      `Error while updating task reward with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task reward ${err}`;
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
      `Error while updating task submission with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task submission ${err}`;
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
      `Error while updating task description with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task description ${err}`;
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
      `Error while updating task title with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task title ${err}`;
  }
});

Moralis.Cloud.define("updateTaskStatus", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleStatusUpdate(task, request.user.id, request.params.status);
    logger.info(
      `Handled status field for task with id ${JSON.stringify(
        request.params.taskId
      )}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const boardObj = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return boardObj[0];
  } catch (err) {
    logger.error(
      `Error while updating task status with task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating task status ${err}`;
  }
});

function handleStatusUpdate(task, userId, status) {
  if (task.get("status") === status) {
    return task;
  }
  handleActivityUpdate(task, userId, status);
  task.set("status", status);
  return task;
}

function handleTitleUpdate(task, userId, title) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    title.length && task.set("title", title);
  }
  return task;
}

function handleDescriptionUpdate(task, userId, description) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    task.set("description", description);
  }
  return task;
}

function handleRewardUpdate(task, userId, value, token, chain, currencyFlag) {
  if (currencyFlag) {
    if (isTaskCreator(task, userId) && value >= 0) {
      task.set("value", parseFloat(value));
      task.set("token", token);
      task.set("chain", chain);
      task.set("nativeCurrencyPayment", true);
    }
  } else {
    if (
      isTaskCreator(task, userId) &&
      value >= 0 &&
      isValidToken(token.address, chain.chainId)
    ) {
      task.set("value", parseFloat(value));
      task.set("token", token);
      task.set("chain", chain);
      task.set("nativeCurrencyPayment", false);
    }
  }
  return task;
}

function handleTagUpdate(task, userId, tags) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    task.set("tags", tags);
  }
  return task;
}

function handleDeadlineUpdate(task, userId, deadline) {
  task.set("deadline", new Date(deadline));
  return task;
}

function handleAssigneeUpdate(task, callerId, assigneeId) {
  if (assigneeId) {
    task.set("assignee", [assigneeId]);
  } else {
    task.set("assignee", []);
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

async function handleColumnChange(boardId, taskId, sourceId, destinationId) {
  const logger = Moralis.Cloud.getLogger();
  try {
    logger.info(
      `Handling column change for task ${boardId} ${taskId} ${sourceId} ${destinationId}`
    );
    const board = await getBoardByObjectId(boardId);
    const task = await getTaskByTaskId(taskId);
    if (!canMoveTask(request.user.id, task, sourceId, destinationId, board))
      throw "Unfortunately you dont have the right access to move task";
    var columnsData = board.get("columns");
    const currentColumn = columnsData[sourceId];
    const index = currentColumn.taskIds.indexOf(taskId);
    logger.info(`current column ${JSON.stringify(currentColumn)}`);
    const startTaskIds = Array.from(currentColumn.taskIds); // copy
    startTaskIds.splice(index, 1);
    logger.info(`${startTaskIds} startTaskIds`);
    const newSource = {
      ...currentColumn,
      taskIds: startTaskIds,
    };
    const newColumn = columnsData[destinationId];
    logger.info(`new column ${JSON.stringify(newColumn)}`);
    const finishTaskIds = Array.from(newColumn.taskIds); // copy
    finishTaskIds.splice(newColumn.taskIds.length, 0, taskId);
    const newDestination = {
      ...newColumn,
      taskIds: finishTaskIds,
    };

    columnsData = {
      ...columnsData,
      [newSource.id]: newSource,
      [newDestination.id]: newDestination,
    };
    logger.info(`columns data ${JSON.stringify(columnsData)}`);
    board.set("columns", columnsData);
    await Moralis.Object.saveAll([board], { useMasterKey: true });
  } catch (err) {
    throw `${err}`;
  }
}

async function getTokenRewardAmounts(chainId, boardId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [
    {
      match: {
        boardId: boardId,
        status: 205,
        value: { $gt: 0 },
        nativeCurrencyPayment: { $ne: true },
        $expr: {
          $eq: ["$chain.chainId", chainId],
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
  const tokenRewardAmounts = await taskQuery.aggregate(pipeline);
  return tokenRewardAmounts;
}

async function getCurrencyRewardAmounts(chainId, boardId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [
    {
      match: {
        boardId: boardId,
        status: 205,
        value: { $gt: 0 },
        nativeCurrencyPayment: { $eq: true },
        $expr: {
          $eq: ["$chain.chainId", chainId],
        },
      },
    },
    {
      group: {
        objectId: {
          assigneeId: "$assignee",
        },
        value: { $sum: "$value" },
      },
    },
  ];
  const currecyRewardAmounts = await taskQuery.aggregate(pipeline);
  return currecyRewardAmounts;
}

async function getTaskIdsWithPendingTokenPayments(chainId, boardId) {
  var taskIdQuery = new Moralis.Query("Task");
  const pipelineIdQuery = [
    {
      match: {
        boardId: boardId,
        status: 205,
        nativeCurrencyPayment: { $ne: true },
        value: { $gt: 0 },
        $expr: {
          $eq: ["$chain.chainId", chainId],
        },
      },
    },
    {
      project: {
        taskId: 1,
      },
    },
  ];
  const taskIds = await taskIdQuery.aggregate(pipelineIdQuery);
  logger.info(`taskIds ${JSON.stringify(taskIds)}`);
  return taskIds.map((a) => a.taskId);
}

async function getTaskIdsWithPendingCurrencyPayments(chainId, boardId) {
  var taskIdQuery = new Moralis.Query("Task");
  const pipelineIdQuery = [
    {
      match: {
        boardId: boardId,
        status: 205,
        nativeCurrencyPayment: { $eq: true },
        value: { $gt: 0 },
        $expr: {
          $eq: ["$chain.chainId", chainId],
        },
      },
    },
    {
      project: {
        taskId: 1,
      },
    },
  ];
  const taskIds = await taskIdQuery.aggregate(pipelineIdQuery);
  logger.info(`taskIds ${JSON.stringify(taskIds)}`);
  return taskIds.map((a) => a.taskId);
}

Moralis.Cloud.define("getBatchPayAmount", async (request) => {
  try {
    var res = {
      contributors: [],
      tokenAddresses: [],
      tokenValues: [],
      uniqueTokenAddresses: [],
      aggregatedTokenValues: [],
      currencyContributors: [],
      currencyValues: [],
      taskIdsWithTokenPayment: [],
      taskIdsWithCurrencyPayment: [],
    };

    // Get task Ids pending payment
    res.taskIdsWithTokenPayment = await getTaskIdsWithPendingTokenPayments(
      request.params.chainId,
      request.params.boardId
    );
    logger.info(
      `res.taskIdsWithTokenPayment ${JSON.stringify(
        res.taskIdsWithTokenPayment
      )}`
    );
    res.taskIdsWithCurrencyPayment =
      await getTaskIdsWithPendingCurrencyPayments(
        request.params.chainId,
        request.params.boardId
      );

    // Get and process token rewards
    const tokenRewardAmounts = await getTokenRewardAmounts(
      request.params.chainId,
      request.params.boardId
    );
    logger.info(`tokenRewardAmounts ${JSON.stringify(tokenRewardAmounts)}`);

    var aggregatedTokenValues = {};

    for (var rewardAmount of tokenRewardAmounts) {
      if (rewardAmount.objectId.assigneeId.length > 0) {
        res.contributors.push(rewardAmount.objectId.assigneeId[0]);
        res.tokenAddresses.push(rewardAmount.objectId.tokenAddress);
        res.tokenValues.push(rewardAmount.value);

        if (!(rewardAmount.objectId.tokenAddress in aggregatedTokenValues)) {
          aggregatedTokenValues[rewardAmount.objectId.tokenAddress] = 0;
        }
        aggregatedTokenValues[rewardAmount.objectId.tokenAddress] +=
          rewardAmount.value;
      }
    }
    logger.info(
      `aggregatedTokenValues ${JSON.stringify(aggregatedTokenValues)}`
    );

    res.uniqueTokenAddresses = Object.keys(aggregatedTokenValues);
    res.aggregatedTokenValues = Object.values(aggregatedTokenValues);

    // Get and process currency rewards
    const currencyRewardAmounts = await getCurrencyRewardAmounts(
      request.params.chainId,
      request.params.boardId
    );

    for (var rewardAmount of currencyRewardAmounts) {
      if (rewardAmount.objectId.assigneeId.length > 0) {
        res.currencyContributors.push(rewardAmount.objectId.assigneeId[0]);
        res.currencyValues.push(rewardAmount.value);
      }
    }

    logger.info(`res ${JSON.stringify(res)}`);

    return res;
  } catch (err) {
    logger.info(
      `Error while getting batch pay amounts for board ${request.params.boardId}: ${err}`
    );
    throw `Error while getting batch pay amounts ${err}`;
  }
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
    throw `Error while assigning task ${err}`;
  }
});

Moralis.Cloud.define("closeTask", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    if (
      isTaskCreator(task, request.user.id) ||
      isTaskReviewer(task, request.user.id)
    ) {
      task = handleStatusUpdate(task, request.user.id, 205);
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
    throw `Error while closing task ${err}`;
  }
});

Moralis.Cloud.define("completePayment", async (request) => {
  try {
    var tasks = await getTasksByTaskIds(request.params.taskIds);
    logger.info(`task ${JSON.stringify(task)}`);

    for (var task of tasks) {
      task.set("status", 300);
    }
    await Moralis.Object.saveAll(tasks, { useMasterKey: true });
    var board = await getBoardObjWithTasksByObjectId(
      task.get("boardId"),
      request.user.id
    );
    return board[0];
  } catch (err) {
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
    throw `Error while completing payment ${err}`;
  }
});

Moralis.Cloud.define("archiveTask", async (request) => {
  var task = await getTaskByTaskId(request.params.taskId);
  task = handleStatusUpdate(task, request.user.id, 400);
  await Moralis.Object.saveAll(task, { useMasterKey: true });
  var board = await getBoardObjWithTasksByObjectId(
    task.get("boardId"),
    request.user.id
  );
  return board[0];
});
