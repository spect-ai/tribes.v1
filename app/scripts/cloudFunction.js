Moralis.Cloud.define("getOrCreateUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  try {
    const userInfoQuery = new Moralis.Query("UserInfo");
    userInfoQuery.equalTo("ethAddress", request.user.get("ethAddress"));
    var userInfo = await userInfoQuery.first();

    if (!userInfo) {
      userInfo = new Moralis.Object("UserInfo");
      userInfo.set("ethAddress", request.user.get("ethAddress"));
      //userInfo.set("ethAddress", request.params.ethAddress);
      userInfo.set("teams", []);
      await Moralis.Object.saveAll([userInfo], { useMasterKey: true });
    }

    return userInfo;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("createTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const teamQuery = new Moralis.Query("Team");
    const teamCount = await teamQuery.count();

    const team = new Moralis.Object("Team");
    const teamId = teamCount + 1;
    team.set("teamId", teamId);
    team.set("name", request.params.name);
    team.set("mission", request.params.mission);
    team.set("treasuryAddress", request.params.treasuryAddress);
    team.set("onchain", false);
    //team.set("members", [{ ethAddress: request.user.get("ethAddress"), role: "admin" }]);
    team.set("members", [
      { ethAddress: request.params.ethAddress, role: "admin" },
    ]);
    team.set("organization", request.params.organization);
    team.set("organizationVerified", false);
    team.set("openApplications", request.params.openApplications);
    team.set("applicationRequirements", request.params.applicationRequirements);
    team.set("latestContributionEpoch", null);
    team.set("latestTaskEpoch", null);
    const userInfoQuery = new Moralis.Query("UserInfo");
    //userInfoQuery.equalTo("ethAddress", request.user.get("ethAddress"))
    userInfoQuery.equalTo("ethAddress", request.params.ethAddress);
    const userInfo = await userInfoQuery.first();
    teamMemberships = userInfo.get("teams").concat([teamId]);
    userInfo.set("teams", teamMemberships);
    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });

    return team;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const teamQuery = new Moralis.Query("Team");
    teamQuery.equalTo("teamId", request.params.teamId);
    var team = await teamQuery.first();

    //const canUpdate = await hasAccess(request.user.get("ethAddress"), team, (requiredAccess = "admin"));
    const canUpdate = await hasAccess(
      request.params.ethAddress,
      team,
      (requiredAccess = "admin")
    );
    if (canUpdate) {
      team.set("name", request.params.name);
      team.set("mission", request.params.mission);
      team.set("treasuryAddress", request.params.treasuryAddress);
      team.set("organization", request.params.organization);
      team.set("openApplications", request.params.openApplications);
      team.set(
        "applicationRequirements",
        request.params.applicationRequirements
      );

      await Moralis.Object.saveAll([team], { useMasterKey: true });
    }

    return team;
  } catch (err) {
    logger.error(`Error while updating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("startEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const teamQuery = new Moralis.Query("Team");
    teamQuery.equalTo("teamId", parseInt(request.params.teamId));
    var team = await teamQuery.first();
    logger.info(JSON.stringify(team));
    logger.info(JSON.stringify(request.user));
    const canStart = await hasAccess(
      request.user.get("ethAddress"),
      team,
      (requiredAccess = "admin")
    );
    logger.info("1");
    //const canStart = await hasAccess(request.params.ethAddress, team, (requiredAccess = "admin"));
    if (canStart) {
      const epoch = new Moralis.Object("Epoch");
      var epochMembers = [];
      var epochTasks = [];
      var votesAllocatedObj = {};
      if (request.params.type === "Contribution" && request.params.members) {
        for (var memberAddress of request.params.members) {
          votesAllocatedObj[memberAddress] = 0;
        }
        for (var memberAddress of request.params.members) {
          epochMembers.push({
            ethAddress: memberAddress,
            votesGiven: 0,
            votesReceived: 0,
            votesRemaining: 100,
            votesAllocated: votesAllocatedObj,
            reward: 0,
          });
        }
      } else if (
        request.params.type === "Contribution" &&
        !request.params.members
      ) {
        for (var member of team.get("members")) {
          logger.info("2");

          votesAllocatedObj[member.ethAddress] = 0;
        }
        for (var member of team.get("members")) {
          epochMembers.push({
            ethAddress: member.ethAddress,
            votesGiven: 0,
            votesReceived: 0,
            votesRemaining: 100,
            votesAllocated: votesAllocatedObj,
            reward: 0,
          });
        }
      } else if (request.params.type === "Task") {
        for (var member of team.get("members")) {
          epochMembers.push({
            ethAddress: member.ethAddress,
            votesGiven: 0,
            votesRemaining: 100,
            votesAllocated: {},
          });
        }
      }
      const epochQuery = new Moralis.Query("Epoch");
      epochQuery.equalTo("teamId", request.params.teamId);
      const epochCount = await epochQuery.count();
      const endTime =
        parseInt(request.params.startTime) + parseInt(request.params.duration);
      epoch.set("teamId", parseInt(request.params.teamId));
      epoch.set("startTime", new Date(parseInt(request.params.startTime)));
      epoch.set("duration", parseInt(request.params.duration)); // in milliseconds
      epoch.set("endTime", new Date(endTime));
      epoch.set("memberStats", epochMembers); // list
      epoch.set("taskStats", epochTasks); // list
      epoch.set("type", request.params.type);
      epoch.set("strategy", request.params.strategy);
      epoch.set("budget", parseInt(request.params.budget));
      epoch.set("epochNumber", epochCount + 1);
      epoch.set("active", true);
      logger.info(`epoch ${JSON.stringify(epoch)}`);

      await Moralis.Object.saveAll([epoch], { useMasterKey: true });

      if (request.params.type === "Contribution") {
        team.set("latestContributionEpoch", epoch.id);
      } else if (request.params.type === "Task") {
        team.set("latestTaskEpoch", epoch.id);
      }
      await Moralis.Object.saveAll([team], { useMasterKey: true });

      return epoch;
    } else {
      logger.info(`User doesnt have access to start epoch`);
      return false;
    }
  } catch (err) {
    logger.error(`Error whilte creating epoch ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getEpoch", async (request) => {
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [{ match: { objectId: request.params.epochId } }];
  const epoch = await epochQuery.aggregate(pipeline);
  return epoch[0];
});

Moralis.Cloud.define("giftContributors", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const epochQuery = new Moralis.Query("Epoch");
    epochQuery.equalTo("objectId", request.params.epochId);
    var epoch = await epochQuery.first();
    logger.info(`epoch ${JSON.stringify(epoch)}`);
    const updatedMemberStats = await calcEffectiveVotes(
      request.params.votes,
      epoch.get("memberStats"),
      request.params.ethAddress
    );
    epoch.set("memberStats", updatedMemberStats);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return epoch;
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("calcTest", async (request) => {
  try {
    return await calcEffectiveVotes(
      request.params.votes,
      request.params.members,
      request.params.ethAddress
    );
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

async function hasAccess(ethAddress, team, requiredAccess) {
  const members = team.get("members");
  for (var member of members) {
    if (member["ethAddress"] === ethAddress) {
      return member["role"] === requiredAccess;
    }
  }
  return false;
}

Moralis.Cloud.define("updateMembers", async (request) => {
  /*request.params.members: [{"ethAddress":"0x232324", "role": "admin", "updateType":"invite"},
                              {"ethAddress':'0x232324', 'role': 'admin', 'updateType':'revoke'}, 
                              {'ethAddress':'0x232324', 'newRole': 'admin', 'oldRole':'general', 'updateType':'roleChange'}, 
                              {'ethAddress':'0x232324', 'role': 'admin', 'updateType':'invite']
      */
  const logger = Moralis.Cloud.getLogger();
  try {
    const teamQuery = new Moralis.Query("Team");
    teamQuery.equalTo("teamId", request.params.teamId);
    var team = await teamQuery.first();
    const canUpdate = await hasAccess(
      request.user.get("ethAddress"),
      team,
      (requiredAccess = "admin")
    );
    if (canUpdate) {
      var invitedMembers = request.params.members.filter(
        (m) => m.updateType === "invite"
      );
      logger.info(`invitedMembers: ${JSON.stringify(invitedMembers)}`);

      var revokedMemberAddresses = [];
      var revokedMembers = request.params.members.filter(
        (m) => m.updateType === "revoke"
      );
      revokedMembers.map((a) => revokedMemberAddresses.push(a.ethAddress));
      logger.info(
        `revokedMemberAddresses: ${JSON.stringify(revokedMemberAddresses)}`
      );

      //var roleChangedMembers = request.params.members.filter((m) => m.updateType === "roleChange");
      await invite(
        invitedMembers,
        request.params.teamId,
        request.user.get("ethAddress")
      );

      //await invite(invitedMembers, request.params.teamId, request.params.ethAddress);
      //await revoke(revokedMemberAddresses, request.params.teamId);

      return true;
    } else {
      //logger.info(`User ${request.user.get("ethAddress")} doesnt have access to update member roles`);
      logger.info(
        `User ${request.user.get(
          "ethAddress"
        )} doesnt have access to update member roles`
      );
      return false;
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

async function invite(members, teamId, invitedBy) {
  //members: [{'ethAddress':'0x232324', 'role': 'admin'}]
  const logger = Moralis.Cloud.getLogger();
  var invites = [];
  logger.info(`Members to invite ${JSON.stringify(members)}`);
  for (var member of members) {
    const invitationQuery = new Moralis.Query("Invitation");
    invitationQuery.equalTo("teamId", teamId);
    invitationQuery.equalTo("ethAddress", member["ethAddress"]);
    const invited = await invitationQuery.first();
    if (!invited && member["ethAddress"] !== invitedBy) {
      const invitation = new Moralis.Object("Invitation");
      invitation.set("ethAddress", member["ethAddress"]);
      invitation.set("role", member["role"]);
      invitation.set("invitedBy", invitedBy);
      invitation.set("active", true);
      invitation.set("teamId", teamId);

      invites.push(invitation);
    }
  }
  logger.info(`invites: ${JSON.stringify(invites)}`);

  await Moralis.Object.saveAll(invites, { useMasterKey: true });
}

async function revoke(members, teamId) {
  //members: Set of members
  const teamQuery = new Moralis.Query("Team");
  teamQuery.equalTo("teamId", teamId);
  var team = await teamQuery.first();
  var membersInTeam = team?.get("members");
  var i = 0;
  for (var member of membersInTeam) {
    if (members.includes(member["ethAddress"])) {
      membersInTeam.splice(i, 1);
    } else {
      ++i;
    }
  }
  team.set("members", membersInTeam);
  logger.info(`team after revokedMembers: ${JSON.stringify(team)}`);

  await Moralis.Object.saveAll([team], { useMasterKey: true });
}

Moralis.Cloud.define("getMyInvites", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const invitationQuery = new Moralis.Query("Invitation");
    //invitationQuery.equalTo("ethAddress", request.user.get("ethAddress"));
    invitationQuery.equalTo("ethAddress", request.params.ethAddress);
    invitationQuery.equalTo("active", true);
    return await invitationQuery.find();
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("acceptInvite", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    // Set invitation to inactive
    const invitationQuery = new Moralis.Query("Invitation");
    //invitationQuery.equalTo("ethAddress", request.user.get("ethAddress"));
    invitationQuery.equalTo("ethAddress", request.params.ethAddress);
    invitationQuery.equalTo("teamId", parseInt(request.params.teamId));
    invitationQuery.equalTo("active", true);
    const invitation = await invitationQuery.first();
    if (invitation) {
      invitation.set("active", false);

      // Add team in user's profile
      /*
      logger.info(`gafsfsfsf`);
      const userInfoQuery = new Moralis.Query("UserInfo");
      userInfoQuery.equalTo("ethAddress", request.params.ethAddress);
      var userInfo = await userInfoQuery.first();
      var userTeams = userInfo.get("teams").concat([parseInt(request.params.teamId)]);
      logger.info(`user teams ${JSON.stringify(userTeams)}`);
      userInfo.set("teams", userTeams);*/

      // Add user and role to team members
      const teamQuery = new Moralis.Query("Team");
      teamQuery.equalTo("teamId", parseInt(request.params.teamId));
      const team = await teamQuery.first();
      const members = team.get("members");
      const member = [
        {
          ethAddress: request.params.ethAddress,
          role: invitation.get("role"),
        },
      ];
      team.set("members", members.concat(member));

      await Moralis.Object.saveAll([invitation, team], {
        useMasterKey: true,
      });

      return true;
    } else {
      logger.info(`Not invited to this team`);
      return false;
    }
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

async function getTeam(teamId) {
  const teamQuery = new Moralis.Query("Team");
  teamQuery.equalTo("teamId", parseInt(teamId));
  return await teamQuery.first();
}

Moralis.Cloud.define("getTeam", async (request) => {
  const teamQuery = new Moralis.Query("Team");
  const pipeline = [{ match: { teamId: parseInt(request.params.teamId) } }];
  const team = await teamQuery.aggregate(pipeline);
  return team[0];
});

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
    const canUpdate = await hasAccess(
      request.params.ethAddress,
      team,
      (requiredAccess = "admin")
    );
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

Moralis.Cloud.define("createTasks", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task;
  var tasks = [];
  logger.info(`newTasks ${JSON.stringify(request.params.newTasks)}`);
  logger.info(`taskSource ${JSON.stringify(request.params.taskSource)}`);
  logger.info(`epochId ${JSON.stringify(request.params.epochId)}`);

  for (var newTask of request.params.newTasks) {
    logger.info(JSON.stringify(newTask));
    if (request.params.taskSource === "github") {
      task = await getGithubTask(
        newTask.title,
        newTask.issueLink,
        newTask.value,
        request.params.epochId,
        newTask.issueNumber
      );
    } else {
      task = await getSpectTask(
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

async function getGithubTask(title, issueLink, value, epochId, issueNumber) {
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

async function getSpectTask(id, title, description, deadline, value, epochId) {
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

Moralis.Cloud.define("getGithubToken", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task;
  var tasks = [];
  return Moralis.Cloud.httpRequest({
    method: "POST",
    url: "https://github.com/login/oauth/access_token",
    params: {
      client_id: "4403e769e4d52b24eeab",
      client_secret: "f525458baff411277086d660ace07b0a4b40af3d",
      code: request.params.code,
      redirect_uri: "http://localhost:3000/",
    },
  })
    .then((httpResponse) => httpResponse.text)
    .catch((error) => logger.info(error));
});

Moralis.Cloud.define("getReward", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const epochQuery = new Moralis.Query("Epoch");
    epochQuery.equalTo("objectId", request.params.epochId);
    var epoch = await epochQuery.first();
    var totalVotesAllocated = 0;
    var updatedMemberStats = epoch.get("memberStats");
    if (epoch.get("type") === "Contribution") {
      for (var member of updatedMemberStats) {
        totalVotesAllocated += member["votesReceived"];
      }
      for (var member of updatedMemberStats) {
        member["reward"] =
          (member["votesReceived"] * budget) / totalVotesAllocated;
      }
    }
    epoch.set("memberStats", updatedMemberStats);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });

    return epoch;
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

async function calcReward(epoch) {
  const logger = Moralis.Cloud.getLogger();
  var totalVotesAllocated = 0;
  var updatedMemberStats = epoch.get("memberStats");
  if (epoch.get("type") === "Contribution") {
    for (var member of updatedMemberStats) {
      totalVotesAllocated += member["votesReceived"];
    }
    for (var member of updatedMemberStats) {
      member["reward"] =
        (member["votesReceived"] * epoch.get("budget")) / totalVotesAllocated;
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
      var value =
        (task.get("votes") * epoch.get("budget")) / totalVotesAllocated;
      logger.info(value);
      task.set("value", value);
    }
    await Moralis.Object.saveAll(tasks, { useMasterKey: true });
  }

  return epoch;
}

Moralis.Cloud.define("endEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const epochQuery = new Moralis.Query("Epoch");
  epochQuery.equalTo("objectId", request.params.epochId);
  var epoch = await epochQuery.first();
  epoch = await calcReward(epoch);
  logger.info(JSON.stringify(epoch));
  epoch.set("active", false);
  logger.info(JSON.stringify(epoch));
  await Moralis.Object.saveAll([epoch], { useMasterKey: true });
  logger.info(JSON.stringify(epoch));

  return epoch;
});

Moralis.Cloud.define("getTaskEpoch", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const epochQuery = new Moralis.Query("Epoch");
  const pipeline = [
    { match: { objectId: request.params.epochId } },
    {
      lookup: {
        from: "Task",
        localField: "_id",
        foreignField: "epochId",
        as: "tasks",
      },
    },
  ];

  return await epochQuery.aggregate(pipeline);
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
