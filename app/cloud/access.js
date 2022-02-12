function hasAccess(userId, team, requiredAccess) {
  const members = team.get("members");
  for (var member of members) {
    if (member["userId"] === userId) {
      return member["role"] === requiredAccess;
    }
  }
  return false;
}

function isMember(userId, team) {
  const members = team.get("members");
  for (var member of members) {
    if (member["userId"] === userId) {
      return true;
    }
  }
  return false;
}

function isTaskStakeholder(userId, task) {
  return task.get("creator") === userId || task.get("reviewer") === userId || task.get("assignee") === userId;
}

function isTaskClient(userId, task) {
  return task.get("creator") === userId || task.get("reviewer") === userId;
}

function isTaskAssignee(userId, task) {
  return task.get("assignee") === userId;
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
