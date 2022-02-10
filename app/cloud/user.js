async function getCreatedUser(userInfo, ethAddress, tribes) {
  userInfo.set("ethAddress", ethAddress);
  userInfo.set("tribes", tribes);
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

async function getUserTribesByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("ethAddress", ethAddress);
  const userInfo = await userInfoQuery.first();
  return userInfo.get("tribes");
}

Moralis.Cloud.define("getOrCreateUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByEthAddress(request.user.get("ethAddress"));
    if (!userInfo) {
      userInfo = new Moralis.Object("UserInfo");
      userInfo = await getCreatedUser(userInfo, request.user.get("ethAddress"), (tribes = []));
      await Moralis.Object.saveAll([userInfo], { useMasterKey: true });
    }
    return userInfo;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});
