async function getNewSpectTask(id, title, description, deadline, value, epochId) {
  var task = new Moralis.Object("Task");
  task.set("id", id);
  task.set("title", title);
  task.set("epochId", epochId);
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

async function getNewGithubTask(title, issueLink, value, epochId, issueNumber) {
  var task = new Moralis.Object("Task");
  logger.info(epochId, issueNumber);
  task.set("title", title);
  task.set("issueLink", issueLink);
  task.set("issueNumber", issueNumber);
  task.set("epochId", epochId);
  task.set("source", "github");
  task.set("value", value);
  task.set("votes", 0);
  task.set("bumpUpCount", 0);
  task.set("dumpDownCount", 0);
  task.set("status", 100);

  return task;
}

Moralis.Cloud.define("createTasks", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task;
  var tasks = [];
  for (var newTask of request.params.newTasks) {
    logger.info(JSON.stringify(newTask));
    if (request.params.taskSource === "github") {
      task = await getNewGithubTask(
        newTask.title,
        newTask.issueLink,
        newTask.value,
        request.params.epochId,
        newTask.issueNumber
      );
    } else {
      task = await getNewSpectTask(
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.deadline,
        newTask.value,
        request.params.epochId
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
  var voterIndex = memberStats.findIndex((a) => a.ethAddress === request.user.get("ethAddress"));

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
