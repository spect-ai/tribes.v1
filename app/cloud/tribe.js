async function getCreatedTribe(
  tribe,
  teamId,
  name,
  members, // List - [objectId]
  roles // Object - {"userId":"role"}
) {
  tribe.set("teamId", teamId);
  tribe.set("name", name);
  tribe.set("members", members);
  tribe.set("roles", roles);
  tribe.set("isPublic", false);
  return tribe;
}

async function getUpdatedTribeDetails(
  tribe,
  name,
  description,
  isPublic,
  discord,
  twitter,
  github,
  logo
) {
  tribe.set("name", name);
  tribe.set("description", description);
  tribe.set("isPublic", isPublic);
  tribe.set("discord", discord);
  tribe.set("twitter", twitter);
  tribe.set("github", github);
  tribe.set("logo", logo);
  return tribe;
}

async function getTribeCount() {
  const tribeQuery = new Moralis.Query("Team");
  return await tribeQuery.count();
}

async function getTribeByTeamId(teamId) {
  const teamQuery = new Moralis.Query("Team");
  teamQuery.equalTo("teamId", parseInt(teamId));
  return await teamQuery.first();
}

async function getTribeObjByTeamId(teamId) {
  const teamQuery = new Moralis.Query("Team");
  const pipeline = [
    { match: { teamId: parseInt(teamId) } },
    {
      lookup: {
        from: "Board",
        localField: "teamId",
        foreignField: "teamId",
        as: "boards",
      },
    },
  ];
  return await teamQuery.aggregate(pipeline);
}

function joinTribeAsMember(tribe, userId) {
  const members = tribe.get("members");
  const roles = tribe.get("roles");
  members.push(userId);
  roles[userId] = "member";
  tribe.set("members", members);
  tribe.set("roles", roles);
  return tribe;
}

Moralis.Cloud.define("getTeam", async (request) => {
  try {
    const team = await getTribeObjByTeamId(request.params.teamId);
    if (team.length === 0) throw "Team not found";
    team[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
      team[0].members
    );

    return team[0];
  } catch (err) {
    logger.error(
      `Error while getting tribe with team id ${request.params.teamId}: ${err}`
    );
    throw `Error while getting tribe ${err}`;
  }
});

Moralis.Cloud.define("getPublicTeams", async (request) => {
  try {
    const teamQuery = new Moralis.Query("Team");
    const pipeline = [{ match: { isPublic: true } }];
    return await teamQuery.aggregate(pipeline);
  } catch (err) {
    logger.error(`Error while getting public tribes: ${err}`);
    throw `Error while getting public tribes ${err}`;
  }
});

Moralis.Cloud.define("getMyTeams", async (request) => {
  try {
    const userInfoQuery = new Moralis.Query("UserInfo");
    userInfoQuery.equalTo("userId", request.user.id);
    const userInfo = await userInfoQuery.first();
    if (userInfo) {
      const teamQuery = new Moralis.Query("Team");
      teamQuery.containedIn("teamId", userInfo.get("tribes"));
      return await teamQuery.find();
    }
  } catch (err) {
    logger.error(
      `Error while getting tribes of user ${request.user.id}: ${err}`
    );
    throw `Error while getting tribes of user ${err}`;
  }
});

Moralis.Cloud.define("createTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = new Moralis.Object("Team");
    const tribeCount = await getTribeCount();
    const teamId = tribeCount + 1;
    // Initialize tribe data
    var roles = {};
    roles[request.user.id] = "admin";
    team = await getCreatedTribe(
      team,
      teamId,
      request.params.name,
      (members = [request.user.id]),
      roles
    );

    // Add tribe to tribe creator's user info
    const userInfo = await getUserByUserId(request.user.id);
    teamMemberships = userInfo.get("tribes").concat([teamId]);
    userInfo.set("tribes", teamMemberships);

    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });

    return team;
  } catch (err) {
    logger.error(
      `Error while creating tribe with name ${request.params.name} ${err}`
    );
    throw `Error while creating tribe ${err}`;
  }
});

Moralis.Cloud.define("updateTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTribeByTeamId(request.params.teamId);
    logger.info("Team found");
    if (hasAccess(request.user.id, team, (requiredAccess = "admin"))) {
      await getUpdatedTribeDetails(
        team,
        request.params.name,
        request.params.description,
        request.params.isPublic,
        request.params.discord,
        request.params.twitter,
        request.params.github,
        request.params.logo
      );
      logger.info("Team updated");
      await Moralis.Object.saveAll([team], { useMasterKey: true });
    }
    logger.info("Team saved");
    team = await getTribeObjByTeamId(request.params.teamId);
    team[0].memberDetails = await getUserIdToUserDetailsMapByUserIds(
      team[0].members
    );
    return team[0];
  } catch (err) {
    logger.error(
      `Error while updating tribe with id ${request.params.teamId}: ${err}`
    );
    throw `Error while updating tribe ${err}`;
  }
});

Moralis.Cloud.define("updateMembers", async (request) => {
  /*request.params.members: [{"ethAddress":"0x232324", "role": "admin", "updateType":"invite"},
                              {"ethAddress':'0x232324', 'role': 'admin', 'updateType':'revoke'}, 
                              {'ethAddress':'0x232324', 'newRole': 'admin', 'oldRole':'general', 'updateType':'roleChange'}, 
                              {'ethAddress':'0x232324', 'role': 'admin', 'updateType':'invite']
      */
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTribeByTeamId(request.params.teamId);
    if (hasAccess(request.user.id, team, (requiredAccess = "admin"))) {
      var invitedMembers = request.params.members.filter(
        (m) => m.updateType === "invite"
      );
      logger.info(`Invited members: ${JSON.stringify(invitedMembers)}`);

      var revokedMemberAddresses = [];
      var revokedMembers = request.params.members.filter(
        (m) => m.updateType === "revoke"
      );
      revokedMembers.map((a) => revokedMemberAddresses.push(a.ethAddress));
      logger.info(`Revoked members: ${JSON.stringify(revokedMemberAddresses)}`);

      //var roleChangedMembers = request.params.members.filter((m) => m.updateType === "roleChange");
      await invite(invitedMembers, request.params.teamId, request.user.id);

      //await invite(invitedMembers, request.params.teamId, request.params.ethAddress);
      //await revoke(revokedMemberAddresses, request.params.teamId);

      return true;
    } else {
      logger.info(
        `User ${request.user.id} doesnt have access to update member roles`
      );
      return false;
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("checkMemberInTeam", async (request) => {
  const team = await getTribeObjByTeamId(request.params.teamId);
  if (team.length === 0 || !team) {
    return false;
  }
  const members = team[0].members;
  if (members) {
    let result = members.filter((member) => member == request.params.userId);
    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
});

Moralis.Cloud.define("addMemberToTribe", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const team = await getTribeByTeamId(request.params.teamId);

  let members = team ? team.get("members") : [];
  if (hasAccess(request.params.adminId, team, (requiredAccess = "admin"))) {
    try {
      if (isMember(request.params.userId, team)) {
        return "member already exist";
      } else {
        let newMember = {
          userId: request.params.userId,
          role: request.params.userType,
        };
        members.push(newMember);
        team.set("members", members);
        await Moralis.Object.saveAll([team], { useMasterKey: true });
        return "invite accepted";
      }
    } catch (err) {
      logger.error(
        `Error while adding Member in team ${request.params.teamId}: ${err}`
      );
      return "Error while adding Member";
    }
  } else {
    logger.error(
      `Error while adding Member in team ${request.params.teamId}: invide not valid`
    );
    return "Invite Not Valid";
  }
});

Moralis.Cloud.define("joinTribe", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const team = await getTribeByTeamId(request.params.teamId);
    const userInfo = await getUserByUserId(request.user.id);
    teamMemberships = userInfo.get("tribes").concat([request.params.teamId]);
    userInfo.set("tribes", teamMemberships);
    let members = team ? team.get("members") : [];
    let roles = team ? team.get("roles") : {};
    roles[request.user.id] = "member";
    members.push(request.user.id);
    team.set("members", members);
    team.set("roles", roles);
    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });
    return true;
  } catch (err) {
    logger.error(`Error while joining tribe ${err}`);
    return false;
  }
});
