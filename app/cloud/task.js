async function getNewSpectTask(
  id,
  title,
  description,
  deadline,
  value,
  epochId,
  boardId
) {
  var task = new Moralis.Object("Task");
  task.set("id", id);
  task.set("title", title);
  task.set("epochId", epochId);
  task.set("boardId", boardId);
  task.set("description", description);
  task.set("deadline", deadline);
  task.set("source", "spect");
  task.set("value", value);
  task.set("votes", 0);
  task.set("bumpUpCount", 0);
  task.set("dumpDownCount", 0);
  task.set("status", 100);

  return task;
}

async function getNewGithubTask(
  title,
  issueLink,
  value,
  epochId,
  issueNumber,
  boardId
) {
  var task = new Moralis.Object("Task");
  logger.info(epochId, issueNumber);
  task.set("title", title);
  task.set("issueLink", issueLink);
  task.set("issueNumber", issueNumber);
  task.set("epochId", epochId);
  task.set("boardId", boardId);
  task.set("source", "github");
  task.set("value", value);
  task.set("votes", 0);
  task.set("bumpUpCount", 0);
  task.set("dumpDownCount", 0);
  task.set("status", 100);

  return task;
}

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

    const taskId = `task-${request.params.boardId}-${
      Object.keys(tasks).length
    }`;
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
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
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
    logger.error(
      `Error while adding task in board ${request.params.boardId}: ${err}`
    );
    return false;
  }
});

Moralis.Cloud.define("createTasks", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task;
  var tasks = [];
  for (var newTask of request.params.newTasks) {
    if (request.params.taskSource === "github") {
      task = await getNewGithubTask(
        newTask.title,
        newTask.issueLink,
        newTask.value,
        request.params.epochId,
        newTask.issueNumber,
        request.params.boardId
      );
    } else {
      task = await getNewSpectTask(
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.deadline,
        newTask.value,
        request.params.epochId,
        request.params.boardId
      );
    }
    tasks.push(task);
  }
  await Moralis.Object.saveAll(tasks, { useMasterKey: true });

  return tasks;
});

Moralis.Cloud.define("voteOnTasks", async (request) => {
  // {"objectId":numvotes}
  const logger = Moralis.Cloud.getLogger();
  const taskQuery = new Moralis.Query("Task");
  taskQuery.equalTo("epochId", request.params.epochId);
  const tasks = await taskQuery.find();
  logger.info(JSON.stringify(request.params.epochId));
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("objectId", request.params.epochId);
  const epoch = await epochQuery.first();
  logger.info(epoch.get("memberStats"));
  const memberStats = epoch.get("memberStats");
  var voterIndex = memberStats.findIndex(
    (a) => a.ethAddress === request.user.get("ethAddress")
  );

  var updatedTasks = [];
  var totalEffectiveVote = 0;
  for (var task of tasks) {
    task.set("votes", task.get("votes") + request.params.votes[task.id]);
    updatedTasks.push(task);

    totalEffectiveVote += Math.pow(request.params.votes[task.id], 2);
    if (memberStats[voterIndex]["votesRemaining"] < totalEffectiveVote) {
      throw "Not enough votes remaining";
    }
  }
  memberStats[voterIndex]["votesRemaining"] -= totalEffectiveVote;
  memberStats[voterIndex]["votesGiven"] += totalEffectiveVote;
  memberStats[voterIndex]["votesAllocated"] = request.params.votes;
  epoch.set("memberStats", memberStats);
  await Moralis.Object.saveAll(updatedTasks.concat(epoch), {
    useMasterKey: true,
  });

  return epoch;
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
      task.set("assignee", request.user.get("ethAddress"));
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
