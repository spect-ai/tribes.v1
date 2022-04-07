async function getTaskByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("taskId", taskId);
  logger.info(`taskId: ${taskId}`);
  return taskQuery.first({ useMasterKey: true });
}

async function getTasksByTaskIds(taskIds) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.containedIn("taskId", taskIds);
  return await taskQuery.find({ useMasterKey: true });
}
async function getTaskObjsByTaskIds(taskIds) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: { $in: taskIds } } }];
  const tasks = await taskQuery.aggregate(pipeline, { useMasterKey: true });
  return tasks;
}

async function getTaskObjByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }, { limit: 1 }];
  const task = await taskQuery.aggregate(pipeline, { useMasterKey: true });
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
        proposals: 0,
        selectedProposals: 0,
      },
    },
  ];
  return await taskQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getTaskObjByBoardIdWithProposals(boardId) {
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
      },
    },
  ];
  return await taskQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getTaskCountInBoard(boardId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("boardId", boardId);
  return await taskQuery.count({ useMasterKey: true });
}

function handleCreateTask(
  task,
  taskId,
  defaultPayment,
  boardId,
  title,
  value,
  userId,
  description,
  cardType
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
  task.set("assignee", []);
  // task.set("description", description);
  task.set("activity", [
    {
      actor: userId,
      action: 100,
      timestamp: new Date(),
    },
  ]);
  cardType ? task.set("cardType", cardType) : task.set("cardType", "Task");
  return task;
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

Moralis.Cloud.define("updateTaskColumn", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  if (request.params.sourceId === request.params.destinationId) {
    throw "Source and destination column are the same";
  }
  try {
    await handleColumnChange(
      request.params.boardId,
      request.params.taskId,
      request.params.sourceId,
      request.params.destinationId,
      request.user.id
    );
    logger.info(
      `Handled column field for task with id ${JSON.stringify(
        request.params.task?.taskId
      )}`
    );
    return await getSpace(request.params.boardId, request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating task status with task Id ${request.params.taskId}: ${err}`
    );
    throw `${err}`;
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
  } else {
    throw `Unauthorized to update description`;
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
  } else {
    throw `Unauthorized to update tags`;
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
    reviewerId && task.set("reviewer", [reviewerId]);
    return task;
  } else throw `Unauthorized to update reviewer`;
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

async function handleColumnChange(
  boardId,
  taskId,
  sourceId,
  destinationId,
  callerId
) {
  const logger = Moralis.Cloud.getLogger();
  try {
    logger.info(
      `Handling column change for task ${boardId} ${taskId} ${sourceId} ${destinationId}`
    );
    const board = await getBoardByObjectId(boardId);
    const task = await getTaskByTaskId(taskId);
    logger.info(`task ${JSON.stringify(task)}`);
    if (!canMoveTask(callerId, task, sourceId, destinationId, board))
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
        // nativeCurrencyPayment: { $ne: true },
        $and: [
          {
            $expr: {
              $eq: ["$chain.chainId", chainId],
            },
          },
          {
            $expr: {
              $ne: ["$token.address", "0x0"],
            },
          },
        ],
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
        $and: [
          {
            $expr: {
              $eq: ["$chain.chainId", chainId],
            },
          },
          {
            $expr: {
              $eq: ["$token.address", "0x0"],
            },
          },
        ],
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
        // nativeCurrencyPayment: { $ne: true }, we dont really need this we using 0x0 address
        value: { $gt: 0 },
        $and: [
          {
            $expr: {
              $eq: ["$chain.chainId", chainId],
            },
          },
          {
            $expr: {
              $ne: ["$token.address", "0x0"],
            },
          },
        ],
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
        value: { $gt: 0 },
        $and: [
          {
            $expr: {
              $eq: ["$chain.chainId", chainId],
            },
          },
          {
            $expr: {
              $eq: ["$token.address", "0x0"],
            },
          },
        ],
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

Moralis.Cloud.define("assignToMe", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    var board = await getBoardByObjectId(task.get("boardId"));
    if (isMember(request.user.id, board)) {
      task = handleAssigneeUpdate(task, request.user.id, request.user.id);
      task = handleActivityUpdate(task, request.user.id, 105);
      task.set("status", 105);
      await Moralis.Object.saveAll(task, { useMasterKey: true });
      return await getSpace(task.get("boardId"), request.user.id);
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
      return await getSpace(task.get("boardId"), request.user.id);
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
    return await getSpace(task.get("boardId"), request.user.id);
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
  return await getSpace(task.get("boardId"), request.user.id);
});

Moralis.Cloud.define("getBatchPayInfo", async (request) => {
  try {
    // Result data structure
    var paymentInfo = {
      approval: {
        required: false,
        uniqueTokenAddresses: [],
        aggregatedTokenValues: [],
      },
      tokens: {
        type: "tokens",
        contributors: [],
        tokenAddresses: [],
        tokenValues: [],
        cardIds: [],
      },
      currency: {
        type: "currency",
        contributors: [],
        tokenAddresses: null,
        tokenValues: [],
        cardIds: [],
      },
    };
    var tasks = await getTasksByTaskIds(request.params.taskIds);
    logger.info(`tasks ${JSON.stringify(tasks)}`);
    var tokenAddressToMinAllowanceRequired = {};
    var tokenAddressToContributorToValue = {};
    var contributorToCurrencyValue = {};

    // Aggregate values
    for (var task of tasks) {
      var assignee = task.get("assignee");

      if (assignee?.length > 0 && task.get("value") && task.get("value") > 0) {
        var contributor = task.get("assignee")[0];
        var value = task.get("value");
        var token = task.get("token");
        if ("address" in token && token?.address !== "0x0") {
          paymentInfo.tokens.cardIds.push(task.get("taskId"));
          if (!(token.address in tokenAddressToContributorToValue)) {
            tokenAddressToContributorToValue[token.address] = {};
          }
          if (
            !(contributor in tokenAddressToContributorToValue[token.address])
          ) {
            tokenAddressToContributorToValue[token.address][contributor] =
              value;
          } else {
            tokenAddressToContributorToValue[token.address][contributor] +=
              value;
          }

          logger.info(
            `tokenAddressToContributorToValue ${JSON.stringify(
              tokenAddressToContributorToValue
            )}`
          );
          if (token.address in tokenAddressToMinAllowanceRequired)
            tokenAddressToMinAllowanceRequired[token.address] += value;
          else tokenAddressToMinAllowanceRequired[token.address] = value;
        } else {
          paymentInfo.currency.cardIds.push(task.get("taskId"));
          if (contributor in contributorToCurrencyValue)
            contributorToCurrencyValue[contributor] += value;
          else contributorToCurrencyValue[contributor] = value;
        }
      }
    }

    // Get if approval required
    tokenAddressToMinAllowanceRequired = await getApprovalInfo(
      tokenAddressToMinAllowanceRequired,
      request.user.get("ethAddress"),
      request.params.distributor,
      request.params.chainIdHex
    );

    // Flatten approval data
    paymentInfo.approval.uniqueTokenAddresses = Object.keys(
      tokenAddressToMinAllowanceRequired
    );
    paymentInfo.approval.aggregatedTokenValues = Object.values(
      tokenAddressToMinAllowanceRequired
    );
    if (paymentInfo.approval.uniqueTokenAddresses.length > 0)
      paymentInfo.approval.required = true;

    // Flatten currency data
    paymentInfo.currency.contributors = Object.keys(contributorToCurrencyValue);
    paymentInfo.currency.tokenValues = Object.values(
      contributorToCurrencyValue
    );

    // Flatten token data
    for (const [tokenAddress, contributorToValue] of Object.entries(
      tokenAddressToContributorToValue
    )) {
      for (const [contributor, value] of Object.entries(contributorToValue)) {
        paymentInfo.tokens.tokenAddresses.push(tokenAddress);
        paymentInfo.tokens.contributors.push(contributor);
        paymentInfo.tokens.tokenValues.push(value);
      }
    }

    return paymentInfo;
  } catch (err) {
    logger.error(`Error while getting batch pay info: ${err}`);
    throw err;
  }
});

async function getApprovalInfo(
  tokenAddressToMinAllowanceRequired,
  callerAddress,
  spenderAddress,
  chainIdHex
) {
  var res = {};

  for (const [tokenAddress, minAllowance] of Object.entries(
    tokenAddressToMinAllowanceRequired
  )) {
    var minAllowanceInWei = await Moralis.Cloud.units({
      method: "toWei",
      value: minAllowance,
    });
    var allowance = await getAllowance(
      chainIdHex,
      tokenAddress,
      callerAddress,
      spenderAddress
    );
    logger.info(`allowance ${JSON.stringify(allowance)}`);
    if (allowance < minAllowanceInWei) {
      res[tokenAddress] = minAllowanceInWei;
    }
  }
  return res;
}
