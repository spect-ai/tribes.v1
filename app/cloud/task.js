async function getTaskByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("taskId", taskId);
  return await taskQuery.first();
}

async function getTaskObjByTaskId(taskId) {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [{ match: { taskId: taskId } }];
  return await taskQuery.aggregate(pipeline);
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
      const board = await getBoardObjByObjectId(task[0].boardId);
      if (task.length === 0) throw `Task ${request.params.taskId} not found`;
      for (var act of task[0].activity) {
        var userQuery = new Moralis.Query("User");
        userQuery.equalTo("objectId", act.actor);
        var user = await userQuery.first({ useMasterKey: true });
        act.username = user.get("username");
        act.profilePicture = user.get("profilePicture");
      }
      var memberIds = [];
      for (var member of board[0].members) {
        memberIds.push(member.userId);
      }
      task[0].members = await getUsernamesByUserIds(memberIds);
      let assigneeIds = [];
      let reviewerIds = [];
      logger.info(JSON.stringify(task[0]));

      task[0].reviewer.filter((a) => reviewerIds.push(a.userId));
      task[0].assignee.filter((a) => assigneeIds.push(a.userId));
      logger.info(` assigneeIds ${JSON.stringify(assigneeIds)}`);
      logger.info(`reviewerIds ${JSON.stringify(reviewerIds)}`);

      task[0].reviewer = task[0].members.filter((a) => reviewerIds.includes(a.userId));
      task[0].assignee = task[0].members.filter((a) => assigneeIds.includes(a.userId));

      const taskParseObj = await getTaskByTaskId(request.params.taskId);
      const access = getFieldLevelAccess(taskParseObj, request.user.id);
      task[0].access = access;
      return task[0];
    }
  } catch (err) {
    logger.error(`Error while getting task from board ${request.params.taskId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("addTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  const board = await getBoardByObjectId(request.params.boardId);
  try {
    const team = await getTribeByTeamId(board.get("teamId"));
    if (isMember(request.user.id, team)) {
      var columns = board.get("columns");
      const numTasks = await getTaskCountInBoard(request.params.boardId);
      const taskId = `task-${request.params.boardId}-${numTasks + 1}`;
      var taskIds = columns[request.params.columnId].taskIds;
      columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
      board.set("columns", columns);

      var task = new Moralis.Object("Task");
      task.set("taskId", taskId);
      task.set("boardId", request.params.boardId);
      task.set("title", request.params.title);
      task.set("token", team.get("preferredToken"));
      task.set("chain", team.get("preferredChain"));
      task.set("value", parseInt(request.params.value));
      task.set("creator", request.user.id);
      task.set("reviewer", [{ userId: request.user.id }]);
      task.set("assignee", []);
      task.set("status", 100);
      task.set("description", request.params.description);
      task.set("activity", [
        {
          actor: request.user.id,
          action: 1,
          timestamp: new Date(),
        },
      ]);
      task.set("issueLink", request.params.issueLink);

      await Moralis.Object.saveAll([task], { useMasterKey: true });
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      const boardObj = await getBoardObjWithTasksByObjectId(request.params.boardId);
      return boardObj[0];
    } else {
      throw "User doesnt have access to create task";
    }
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    const boardObj = await getBoardObjWithTasksByObjectId(request.params.boardId);
    return boardObj[0];
  }
});

Moralis.Cloud.define("updateTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.task?.taskId);
  try {
    task = handleTitleUpdate(task, request.user.id, request.params.task.title);

    task = handleDescriptionUpdate(task, request.user.id, request.params.task.description);
    task = handleRewardUpdate(
      task,
      request.user.id,
      request.params.task.value,
      request.params.task.token,
      request.params.task.chain
    );
    task = handleTagUpdate(task, request.user.id, request.params.task.tags);
    task = handleDeadlineUpdate(task, request.user.id, request.params.task.deadline);
    task = handleAssigneeUpdate(task, request.user.id, request.params.task.assignee);
    task = handleReviewerUpdate(task, request.user.id, request.params.task.reviewer);
    task = handleSubmissionUpdate(task, request.user.id, request.params.task.submission);
    task = handleStatusChange(task, request.user.id, request.params.task.status);

    logger.info(`Updating task ${JSON.stringify(task)}`);

    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    const board = await getBoardObjWithTasksByObjectId(task.get("boardId"));
    return board[0];
  } catch (err) {
    logger.error(`Error while updating task with task Id ${request.params.task?.taskId}: ${err}`);
    const board = await getBoardObjWithTasksByObjectId(task.get("boardId"));
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
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    task.description && task.set("description", description);
  }
  return task;
}

function handleRewardUpdate(task, userId, value, token, chain) {
  if (
    isTaskCreator(task, userId) &&
    value > 0 &&
    ["wmatic", "weth", "usdc"].includes(token.toLowerCase()) &&
    ["polygon", "ethereum"].includes(chain.toLowerCase())
  ) {
    task.set("value", parseInt(value));
    task.set("token", token);
    task.set("chain", chain);
  }
  return task;
}

function handleTagUpdate(task, userId, tags) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId) || isTaskAssignee(task, userId)) {
    task.set("tags", tags);
  }
  return task;
}

function handleDeadlineUpdate(task, userId, deadline) {
  if (isTaskCreator(task, userId) && deadline) {
    task.set("deadline", new Date(deadline));
  }
  return task;
}

function handleAssigneeUpdate(task, userId, assignee) {
  if (
    // isTaskCreator(task, userId) ||
    // isTaskReviewer(task, userId) ||
    // isTaskAssignee(task, userId)
    task.status !== 100
  ) {
    assignee && task.set("assignee", [assignee]);
  }
  return task;
}

function handleReviewerUpdate(task, userId, reviewer) {
  if (isTaskCreator(task, userId) || isTaskReviewer(task, userId)) {
    reviewer && task.set("reviewer", [reviewer]);
  }
  return task;
}

function handleSubmissionUpdate(task, userId, submission) {
  if ((submission || task.get("submission")) && isTaskAssignee(task, userId) && task.get("submission") !== submission) {
    task.set("submission", submission);
  }
  return task;
}

function handleActivityUpdate(task, userId, action) {
  task.set("activity", [{ actor: userId, action: action, timestamp: new Date() }, ...task.get("activity")]);
  return task;
}

function handleStatusChange(task, userId, status) {
  const statusCode = getStatusCode(status);
  if (statusCode === 100 && (isTaskCreator(task, userId) || isTaskReviewer(task, userId))) {
    task.set("status", statusCode);
  } else if (statusCode === 102) {
    task.set("status", statusCode);
    task = handleActivityUpdate(task, userId, 5);
  } else if (statusCode === 105) {
    task.set("status", statusCode);
    task = handleActivityUpdate(task, userId, 7);
  } else if (statusCode === 200) {
    task.set("status", statusCode);
    task = handleActivityUpdate(task, userId, 10);
  } else if (statusCode === 205) {
    task.set("status", statusCode);
    task = handleActivityUpdate(task, userId, 15);
  } else if (statusCode === 300) {
    task.set("status", statusCode);
    task = handleActivityUpdate(task, userId, 20);
  }
  return task;
}

Moralis.Cloud.define("getBatchPayAmount", async (request) => {
  const taskQuery = new Moralis.Query("Task");
  const pipeline = [
    { match: { boardId: request.params.boardId } },
    { match: { status: 205 } },
    { match: { value: { $gt: 0 } } },
    {
      group: {
        objectId: { chain: "$chain", token: "$token", assigneeId: "$assignee.userId" },
        value: { $sum: "$value" },
      },
    },
  ];
  const tasks = await taskQuery.aggregate(pipeline);
  logger.info(`tyasks ${JSON.stringify(tasks)}`);

  /*
[
    ({ total: 2, objectId: { chain: "Polygon", token: "Wmatic" } },
    { total: 3, objectId: { chain: "Polygon", token: "USDC" } })
  ][{ chain: "polygon", token: "Matic", amounts: [{ contributor: "adadad", value: 10 }] }];*/
  var paymentAmount = {};
  var polygonContributorOrder = [];
  var polygonTokenOrder = [];
  var polygonValueOrder = [];
  var ethereumContributorOrder = [];
  var ethereumTokenOrder = [];
  var ethereumValueOrder = [];
  logger.info(`tyasks2 ${JSON.stringify(paymentAmount)}`);
  for (var task of tasks) {
    if (task["objectId"]["chain"] === "Polygon") {
      var user = await getUsernameProfilePicByUserId(task["objectId"]["assigneeId"][0]);
      polygonContributorOrder.push(user);
      polygonTokenOrder.push(task["objectId"]["token"]);
      polygonValueOrder.push(task["value"]);
    } else if (task["objectId"]["chain"] === "Ethereum") {
      var user = await getUsernameProfilePicByUserId(task["objectId"]["assigneeId"][0]);
      ethereumContributorOrder.push(user);
      ethereumTokenOrder.push(task["objectId"]["token"]);
      ethereumValueOrder.push(task["value"]);
    }
  }
  if (polygonTokenOrder.length > 0)
    paymentAmount["Polygon"] = [polygonTokenOrder, polygonContributorOrder, polygonValueOrder];
  if (ethereumTokenOrder.length > 0)
    paymentAmount["Ethereum"] = [ethereumTokenOrder, ethereumContributorOrder, ethereumValueOrder];

  return paymentAmount;

  /*
Polygon: [
      [Matic, USDC]
      ["chaks.eth", "0xavp.eth"],
      [10, 5],
    USDC: [
      ["contributorAddress", "contributorAddress2"],
      [10, 5],
    ],
  },



    export const amountData = {
  Polygon: {
    Matic: [
      ["chaks.eth", "0xavp.eth"],
      [10, 5],
    ],
    USDC: [
      ["contributorAddress", "contributorAddress2"],
      [10, 5],
    ],
  },
  Ethereum: {
    Weth: [
      ["contributorAddress", "contributorAddress2"],
      [10, 5],
    ],
  },
};*/
});

/* Not needed not tested
Moralis.Cloud.define("startWork", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    if (isTaskAssignee(task, request.user.id) && !assignee) {
      task = handleActivityUpdate(task, request.user.id, 7);
      await Moralis.Object.saveAll(task, { useMasterKey: true });
      const board = await getBoardObjWithTasksByObjectId(task.get("boardId"));
      return board[0];
    }
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("closeTask", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    task = handleActivityUpdate(task, request.user.id, 15);
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    const board = await getBoardObjWithTasksByObjectId(task.get("boardId"));
    return board[0];
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});

Moralis.Cloud.define("distributeTaskReward", async (request) => {
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    task = handleActivityUpdate(task, request.user.id, 20);
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    const board = await getBoardObjWithTasksByObjectId(task.get("boardId"));
    return board[0];
  } catch (err) {
    logger.error(`Error while adding task in board ${request.params.boardId}: ${err}`);
    return false;
  }
});
*/
