async function getCreatedUser(userInfo, userId) {
  userInfo.set("userId", userId);
  userInfo.set("tribes", []);
  return userInfo;
}

async function getUpdatedUser(userInfo, tribes) {
  userInfo.set("tribes", tribes);
  return userInfo;
}

async function getUserByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("ethAddress", ethAddress);
  return await userInfoQuery.first();
}

async function getUserByUserId(userId) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("userId", userId);
  return await userInfoQuery.first();
}

async function getUserDetailsByUserIds(userIds) {
  const userQuery = new Moralis.Query("User");
  const pipeline = [
    { match: { objectId: { $in: userIds } } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getUserIdToUserDetailsMapByUserIds(userIds) {
  const userDetails = await getUserDetailsByUserIds(userIds);
  var userDetailsMap = {};
  for (var userDetail of userDetails)
    userDetailsMap[userDetail.objectId] = userDetail;
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
      userInfo = await getCreatedUser(userInfo, request.user.id);

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
