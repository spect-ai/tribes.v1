async function getCreatedDiscordUser(
  userInfo,
  userId,
  username,
  avatar,
  email,
  access_token,
  refresh_token
) {
  userInfo.set("userId", userId);
  userInfo.set("tribes", []);
  userInfo.set("username", username);
  userInfo.set("avatar", avatar);
  userInfo.set("EmailId", email);
  userInfo.set("access_token", access_token);
  userInfo.set("refresh_token", refresh_token);
  userInfo.set("is_discord", true);
  return userInfo;
}

async function getUserObj(userId) {
  const userQuery = new Moralis.Query("UserInfo");
  const pipeline = [
    { match: { userId: userId } },
    {
      project: {
        access_token: 0,
        refresh_token: 0,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

// Moralis.Cloud.define("getDiscordToken", async (request) => {
//   const logger = Moralis.Cloud.getLogger();
//   logger.info(`code param ${request.params.code}`);

//   const params = new URLSearchParams();
//   params.append("client_id", "942494607239958609");
//   params.append("client_secret", "Flci7Du4jcxDxjucavVmmiTThDxzW7qE");
//   params.append("grant_type", "authorization_code");
//   params.append("code", request.params.code);
//   params.append("redirect_uri", "http://localhost:3000/redirect");
//   params.append("scope", "identify");
//   logger.info(`params ${params}`);
//   return Moralis.Cloud.httpRequest({
//     method: "POST",
//     url: "https://discord.com/api/oauth2/token",
//     body: "client_id=942494607239958609&client_secret=Flci7Du4jcxDxjucavVmmiTThDxzW7qE&code=X8CprCIu9DaljvGW6aZ5Xg8nDmZRRJ&grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=identify",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   })
//     .then((httpResponse) => {
//       logger.log(` httpresponse ${JSON.stringify(httpResponse)}`);
//       logger.log(`text ${JSON.stringify(httpResponse.text)}`);
//     })
//     .catch((error) => {
//       logger.info(error);
//       throw `Error while getting Github token ${JSON.stringify(error)}`;
//     });
// });

Moralis.Cloud.define("getOrCreateDiscordUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    logger.info(`getOrCreateDiscordUser ${JSON.stringify(request.params)}`);
    if (!request.params.userId) {
      throw `No userId provided`;
    }
    var userInfo = await getUserByUserId(request.params.userId);
    if (!userInfo) {
      userInfo = new Moralis.Object("UserInfo");

      // userInfo.set("access_token", request.params.access_token);
      // userInfo.set("refresh_token", request.params.refresh_token);
    }
    userInfo = await getCreatedDiscordUser(
      userInfo,
      request.params.userId,
      request.params.username,
      request.params.avatar,
      request.params.email,
      request.params.accessToken,
      request.params.refreshToken
    );
    logger.info(
      `userInfo ${JSON.stringify(userInfo)} ${request.params.access_token}`
    );
    await Moralis.Object.saveAll([userInfo], {
      useMasterKey: true,
    });
    const userobj = await getUserObj(request.params.userId);
    return userobj[0];
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getUserInfo", async (request) => {
  const userobj = await getUserObj(request.params.userId);
  return userobj[0];
});

Moralis.Cloud.define("getRefreshToken", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByObjId(request.params.objectId);
    return userInfo.get("refresh_token");
  } catch (err) {
    logger.error(`Error while storing tokens ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getAccessToken", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByObjId(request.params.objectId);
    return userInfo.get("access_token");
  } catch (err) {
    logger.error(`Error while storing tokens ${err}`);
    return false;
  }
});
