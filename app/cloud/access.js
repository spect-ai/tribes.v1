function hasAccess(userId, team, requiredAccess) {
  // const members = team.get("members");
  // for (var member of members) {
  //   if (member["userId"] === userId) {
  //     return member["role"] === requiredAccess;
  //   }
  // }
  return true;
}

function isMember(userId, entity) {
  // const members = entity.get("members");
  // for (var member of members) {
  //   if (member["userId"] === userId) {
  //     return true;
  //   }
  // }
  // return false;
  return true;
}

function canCreateTask(userId, columnId, boardObj) {}

function canMoveTask(
  callerId,
  task,
  sourceColumnId,
  destinationColumnId,
  board
) {
  if (
    isTaskCreator(task, callerId) ||
    isTaskReviewer(board, callerId) ||
    (isTaskAssignee(board, callerId) && destinationColumnId !== "column-3")
  ) {
    logger.info(`something too`);
    return true;
  } else return isAdmin(callerId, board);
}

function isAdminFromObj(userId, entity) {
  const members = entity.members;
  for (var member of members) {
    if (member.objectId === userId) {
      return member.objectId === "admin";
    }
  }
  return false;
}

function isAdmin(userId, entity) {
  const members = entity.get("members");
  for (var member of members) {
    if (member["userId"] === userId) {
      return member["userId"] === "admin";
    }
  }
  return false;
}

function getSpaceAccess(userId, entity) {
  for (var member of entity.members) {
    if (member["userId"] === userId) {
      return member["role"];
    }
  }
  return "none";
}

function isTaskCreator(task, userId) {
  return task.get("creator") === userId;
}

function isTaskAssignee(task, userId) {
  for (var assigneeId of task.get("assignee")) {
    if (userId === assigneeId) {
      return true;
    }
  }
  return false;
}

function isTaskReviewer(task, userId) {
  for (var reviewerId of task.get("reviewer")) {
    if (userId === reviewerId) {
      return true;
    }
  }
  return false;
}

function isTaskCreatorFromTaskObj(task, userId) {
  return task.creator === userId;
}

function isTaskAssigneeFromTaskObj(task, userId) {
  for (var assigneeId of task.assignee) {
    if (userId === assigneeId) {
      return true;
    }
  }
  return false;
}

function isTaskReviewerFromTaskObj(task, userId) {
  for (var reviewerId of task.reviewer) {
    if (userId === reviewerId) {
      return true;
    }
  }
  return false;
}

function getFieldLevelAccess(task, userId) {
  var access = {};
  access["creator"] = isTaskCreatorFromTaskObj(task, userId);
  access["assignee"] = isTaskAssigneeFromTaskObj(task, userId);
  access["reviewer"] = isTaskReviewerFromTaskObj(task, userId);
  return access;
}

async function invite(members, teamId, invitedBy) {
  //members: [{'ethAddress':'0x232324', 'role': 'admin'}]
  const logger = Moralis.Cloud.getLogger();
  var invites = [];
  for (var member of members) {
    const invitationQuery = new Moralis.Query("Invitation");
    invitationQuery.equalTo("teamId", teamId);
    invitationQuery.equalTo("ethAddress", member["ethAddress"]);
    const invited = await invitationQuery.first();
    if (!invited && member["ethAddress"] !== invitedBy) {
      const invitation = new Moralis.Object("Invitation");
      invitation.set("ethAddress", member["ethAddress"].toLowerCase());
      invitation.set("role", member["role"]);
      invitation.set("invitedBy", invitedBy);
      invitation.set("active", true);
      invitation.set("teamId", teamId);

      invites.push(invitation);
    }
  }
  await Moralis.Object.saveAll(invites, { useMasterKey: true });
}

async function revoke(members, teamId) {
  //members: List of members
  const teamQuery = new Moralis.Query("Team");
  teamQuery.equalTo("teamId", teamId);
  var team = await teamQuery.first();
  var membersInTeam = team?.get("members");
  var i = 0;
  for (var member of membersInTeam) {
    if (members.includes(member["userId"])) {
      membersInTeam.splice(i, 1);
    } else {
      ++i;
    }
  }
  team.set("members", membersInTeam);

  await Moralis.Object.saveAll([team], { useMasterKey: true });
}

Moralis.Cloud.define("getMyInvites", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const invitationQuery = new Moralis.Query("Invitation");
    invitationQuery.equalTo("ethAddress", request.user.get("ethAddress"));
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
    invitationQuery.equalTo("ethAddress", request.user.get("ethAddress"));
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
      const team = await getTribeByTeamId(request.params.teamId);
      const members = team.get("members");
      const member = [
        {
          userId: request.user.id,
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

Moralis.Cloud.define("sendInvite", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const members = [
      {
        ethAddress: request.params.ethAddress,
        role: "invited",
      },
    ];
    await invite(members, request.params.teamId, request.params.invitedBy);
    return true;
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});
