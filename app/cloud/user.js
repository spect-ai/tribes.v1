async function getCreatedUser(userInfo, userId, ethAddress) {
  userInfo.set("userId", userId);
  userInfo.set("tribes", []);
  userInfo.set("ethAddress", ethAddress);
  return userInfo;
}

async function getUpdatedUser(userInfo, tribes) {
  userInfo.set("tribes", tribes);
  return userInfo;
}

async function getUserByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("ethAddress", ethAddress);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByUserId(userId) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("userId", userId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByObjId(objectId) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("objectId", objectId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserDetailsByUserIds(userIds) {
  const userQuery = new Moralis.Query("UserInfo");
  const pipeline = [
    { match: { userId: { $in: userIds } } },
    {
      project: {
        userId: 1,
        username: 1,
        avatar: 1,
        ethAddress: 1,
        discordId: 1,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getUserIdToUserDetailsMapByUserIds(userIds) {
  const userDetails = await getUserDetailsByUserIds(userIds);
  var userDetailsMap = {};
  for (var userDetail of userDetails)
    userDetailsMap[userDetail.userId] = userDetail;
  return userDetailsMap;
}

async function getUsernameProfilePicByUserId(userId) {
  const userQuery = new Moralis.Query("User");
  const pipeline = [
    { match: { objectId: userId } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
      },
    },
  ];
  const user = await userQuery.aggregate(pipeline, { useMasterKey: true });
  if (user) return user[0];
  else return null;
}

async function getUserCount() {
  const userQuery = new Moralis.Query("User");
  return await userQuery.count({ useMasterKey: true });
}

function getAllAssociatedUsersIds(board, tasks, epochs) {
  const boardMembers = board.members;
  var taskMembers = [];
  for (var task of tasks) {
    taskMembers = taskMembers.concat(task.assignee).concat(task.reviewer);
    taskMembers.push(task.creator);
  }

  var epochMembers = [];
  for (var epoch of epochs) {
    epochMembers = epochMembers.concat(Object.keys(epoch.memberStats));
    if (epoch.type === "Member") {
      epochMembers = epochMembers.concat(epoch.choices);
    }
  }
  var uniqueUserIds = boardMembers
    .concat(taskMembers)
    .concat(epochMembers)
    .filter(onlyUnique);

  return uniqueUserIds;
}

Moralis.Cloud.define("getUserCount", async (request) => {
  return await getUserCount();
});

Moralis.Cloud.define("getOrCreateUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      var userCount = await getUserCount();
      userInfo = new Moralis.Object("UserInfo");
      userInfo = await getCreatedUser(
        userInfo,
        request.user.id,
        request.user.get("ethAddress")
      );
      request.user.set("username", `fren${userCount}`);
      await Moralis.Object.saveAll([userInfo, request.user], {
        useMasterKey: true,
      });
    }
    return request.user;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});
