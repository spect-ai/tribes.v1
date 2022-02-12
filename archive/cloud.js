async function calcReward(epoch) {
  const logger = Moralis.Cloud.getLogger();
  var totalVotesAllocated = 0;
  var updatedMemberStats = epoch.get("memberStats");
  if (epoch.get("type") === "Contribution") {
    for (var member of updatedMemberStats) {
      totalVotesAllocated += member["votesReceived"];
    }
    for (var member of updatedMemberStats) {
      member["reward"] = (member["votesReceived"] * epoch.get("budget")) / totalVotesAllocated;
    }
    epoch.set("memberStats", updatedMemberStats);
  }
  if (epoch.get("type") === "Task") {
    const taskQuery = new Moralis.Query("Task");
    taskQuery.equalTo("epochId", epoch.id);
    const tasks = await taskQuery.find();
    var totalVotesAllocated = 0;
    for (var task of tasks) {
      totalVotesAllocated += task.get("votes");
    }
    logger.info(JSON.stringify(tasks));
    for (var task of tasks) {
      var value = (task.get("votes") * epoch.get("budget")) / totalVotesAllocated;
      logger.info(value);
      task.set("value", value);
    }
    await Moralis.Object.saveAll(tasks, { useMasterKey: true });
  }

  return epoch;
}

async function calcEffectiveVotes(votes, members, voterAddress) {
  /* votes: {"0x232324": 10,
                  '0x232324': 19)
          members: [{"ethAddress":"0x232324", "votesGiven": 10, "votesReceived":9, "votesRemaining":90},
                  {"ethAddress':'0x232324', 'votes': 19, "votesReceived":9, "votesRemaining":90}]
        */
  var totalEffectiveVote = 0;
  logger.info("members");
  logger.info(JSON.stringify(members));
  logger.info(JSON.stringify(voterAddress));
  var voterStats = members.filter((a) => a.ethAddress === voterAddress);
  logger.info(JSON.stringify(voterStats));
  var idx = 0;
  var voterIdx;
  for (var member of members) {
    if (member["ethAddress"] !== voterAddress) {
      var numVotes = votes[member["ethAddress"]];
      member["votesReceived"] += numVotes;
      totalEffectiveVote += Math.pow(numVotes, 2);
      if (voterStats["votesRemaining"] < totalEffectiveVote) {
        throw "Not enough votes remaining";
      }
      idx++;
    } else {
      voterIdx = idx;
    }
  }
  logger.info(`${voterIdx} voteridx`);
  members[voterIdx]["votesRemaining"] -= totalEffectiveVote;
  members[voterIdx]["votesGiven"] += totalEffectiveVote;
  members[voterIdx]["votesAllocated"] = votes;

  return members;
}

async function getUserTribesByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("ethAddress", ethAddress);
  const userInfo = await userInfoQuery.first();
  return userInfo.get("tribes");
}

async function getBoard(
  name,
  description,
  teamId,
  strategy,
  settlementTokenName,
  settlementTokenAddress,
  settlementTokenType,
  bumpUpValue,
  dumpDownValue,
  bumpUpTillPause,
  dumpDownTillPause,
  update = false
) {
  var board = new Moralis.Object("Board");
  board.set("name", name);
  board.set("description", description);
  if (!update) {
    board.set("teamId", teamId);
  }
  board.set("strategy", strategy);
  board.set("settlementTokenName", settlementTokenName);
  board.set("settlementTokenAddress", settlementTokenAddress);
  board.set("settlementTokenType", settlementTokenType);
  board.set("bumpUpValue", bumpUpValue);
  board.set("dumpDownValue", dumpDownValue);
  board.set("bumpUpTillPause", bumpUpTillPause);
  board.set("dumpDownTillPause", dumpDownTillPause);

  return board;
}

Moralis.Cloud.define("createBoard", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const board = await getBoard(
      request.params.name,
      request.params.description,
      request.params.teamId,
      request.params.strategy,
      request.params.settlementTokenName,
      request.params.settlementTokenAddress,
      request.params.settlementTokenType,
      request.params.bumpUpValue,
      request.params.dumpDownValue,
      request.params.bumpUpTillPause,
      request.params.dumpDownTillPause,
      (update = false)
    );
    await Moralis.Object.saveAll([board], { useMasterKey: true });
    return board;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateBoard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTeam(request.params.teamId);
    const canUpdate = await hasAccess(request.user.id, team, (requiredAccess = "admin"));
    if (canUpdate) {
      const board = await getBoard(
        request.params.name,
        request.params.description,
        request.params.teamId,
        request.params.strategy,
        request.params.settlementTokenName,
        request.params.settlementTokenAddress,
        request.params.settlementTokenType,
        request.params.bumpUpValue,
        request.params.dumpDownValue,
        request.params.bumpUpTillPause,
        request.params.dumpDownTillPause,
        (update = true)
      );
      await Moralis.Object.saveAll([board], { useMasterKey: true });
      return board;
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
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
  var voterIndex = memberStats.findIndex((a) => a.userId === request.user.id);

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

async function getNewSpectTask(id, title, description, deadline, value, epochId, boardId) {
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

async function getNewGithubTask(title, issueLink, value, epochId, issueNumber, boardId) {
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
