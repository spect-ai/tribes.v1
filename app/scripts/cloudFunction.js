Moralis.Cloud.define("getOrCreateUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  try {
    const userInfoQuery = new Moralis.Query("UserInfo");
    userInfoQuery.equalTo("ethAddress", request.params.ethAddress);
    var userInfo = await userInfoQuery.first();

    if (!userInfo) {
      userInfo = new Moralis.Object("UserInfo");
      //userInfo.set("ethAddress", request.user.get("ethAddress"));
      userInfo.set("ethAddress", request.params.ethAddress);
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
    team.set("address", request.params.teamAddress);
    team.set("treasuryAddress", request.params.treasuryAddress);
    team.set("onchain", false);
    //team.set("members", [{ ethAddress: request.user.get("ethAddress"), role: "admin" }]);
    team.set("members", [{ ethAddress: request.params.ethAddress, role: "admin" }]);
    team.set("organization", request.params.organization);
    team.set("organizationVerified", false);
    team.set("openApplications", request.params.openApplications);
    team.set("applicationRequirements", request.params.applicationRequirements);

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
    const canUpdate = await hasAccess(request.params.ethAddress, team, (requiredAccess = "admin"));
    if (canUpdate) {
      team.set("name", request.params.name);
      team.set("mission", request.params.mission);
      team.set("treasuryAddress", request.params.treasuryAddress);
      team.set("organization", request.params.organization);
      team.set("openApplications", request.params.openApplications);
      team.set("applicationRequirements", request.params.applicationRequirements);

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
    teamQuery.equalTo("teamId", request.params.teamId);
    var team = await teamQuery.first();
    //const canStart = await hasAccess(request.user.get("ethAddress"), team, (requiredAccess = "admin"));
    const canStart = await hasAccess(request.params.ethAddress, team, (requiredAccess = "admin"));

    if (canStart) {
      const epoch = new Moralis.Object("Epoch");
      var epochMembers = [];
      for (var memberAddress of request.params.members) {
        epochMembers.push({ ethAddress: memberAddress, votesGiven: 0, votesReceived: 0, votesRemaining: 100 });
      }
      const epochQuery = new Moralis.Query("Epoch");
      epochQuery.equalTo("teamId", request.params.teamId);
      const epochCount = await epochQuery.count();
      const endTime = request.params.startTime + request.params.duration;
      epoch.set("teamId", request.params.teamId);
      epoch.set("startTime", new Date(request.params.startTime));
      epoch.set("duration", request.params.duration); // in milliseconds
      epoch.set("endTime", new Date(endTime));
      epoch.set("memberStats", epochMembers); // list
      epoch.set("type", request.params.type);
      epoch.set("strategy", request.params.strategy);
      epoch.set("budget", request.params.budget);
      epoch.set("epochNumber", epochCount + 1);
      logger.info(`epoch ${JSON.stringify(epoch)}`);

      await Moralis.Object.saveAll([epoch], { useMasterKey: true });
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

Moralis.Cloud.define("giftContributors", async (request) => {
  try {
    const logger = Moralis.Cloud.getLogger();
    const epochQuery = new Moralis.Query("Epoch");
    epochQuery.equalTo("epochId", request.params.epochId);
    var epoch = await epochQuery.first();

    const updatedMemberStats = await calcEffectiveVotes(
      request.params.votes,
      epoch.get("memberStats"),
      request.params.ethAddress
    );
    epoch.set("memberStats", updatedMemberStats);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("calcTest", async (request) => {
  try {
    return await calcEffectiveVotes(request.params.votes, request.params.members, request.params.ethAddress);
  } catch (err) {
    logger.error(`Error whilte creating team ${err}`);
    return false;
  }
});

async function calcEffectiveVotes(votes, members, voterAddress) {
  /* votes: {"0x232324": 10,
            '0x232324': 19)
    members: [{"ethAddress":"0x232324", "votesGiven": 10, "votesReceived":9, "votesRemaining":90},
            {"ethAddress':'0x232324', 'votes': 19, "votesReceived":9, "votesRemaining":90}]
  */
  var totalEffectiveVote = 0;
  var voterStats = members.filter((a) => a.ethAddress === voterAddress);
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
  members[voterIdx]["votesRemaining"] -= totalEffectiveVote;
  return members;
}

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
    const canUpdate = await hasAccess(request.params.ethAddress, team, (requiredAccess = "admin"));
    if (canUpdate) {
      var invitedMembers = request.params.members.filter((m) => m.updateType === "invite");
      logger.info(`invitedMembers: ${JSON.stringify(invitedMembers)}`);

      var revokedMemberAddresses = [];
      var revokedMembers = request.params.members.filter((m) => m.updateType === "revoke");
      revokedMembers.map((a) => revokedMemberAddresses.push(a.ethAddress));
      logger.info(`revokedMemberAddresses: ${JSON.stringify(revokedMemberAddresses)}`);

      var roleChangedMembers = request.params.members.filter((m) => m.updateType === "roleChange");
      //invite(invitedMembers, request.params.teamId, request.user.get("ethAddress"));

      await invite(invitedMembers, request.params.teamId, request.params.ethAddress);
      await revoke(revokedMemberAddresses, request.params.teamId);

      return true;
    } else {
      //logger.info(`User ${request.user.get("ethAddress")} doesnt have access to update member roles`);
      logger.info(`User ${request.params.ethAddress} doesnt have access to update member roles`);
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
    invitationQuery.equalTo("teamId", request.params.teamId);
    invitationQuery.equalTo("active", true);
    const invitation = await invitationQuery.first();
    if (invitation) {
      invitation.set("active", false);

      // Add team in user's profile
      const userInfoQuery = new Moralis.Query("UserInfo");
      userInfoQuery.equalTo("ethAddress", request.params.ethAddress);
      var userInfo = await userInfoQuery.first();
      var userTeams = userInfo.get("teams").concat([request.params.teamId]);
      logger.info(`user teams ${JSON.stringify(userTeams)}`);
      userInfo.set("teams", userTeams);

      // Add user and role to team members
      const teamQuery = new Moralis.Query("Team");
      teamQuery.equalTo("teamId", request.params.teamId);
      const team = await teamQuery.first();
      const members = team.get("members");
      const member = [{ ethAddress: request.params.ethAddress, role: invitation.get("role") }];
      team.set("members", members.concat(member));

      await Moralis.Object.saveAll([invitation, userInfo, team], { useMasterKey: true });

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
  teamQuery.equalTo("teamId", teamId);
  return await teamQuery.first();
}

Moralis.Cloud.define("getTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  return await getTeam(request.params.teamId);
});
