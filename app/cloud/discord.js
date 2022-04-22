async function getCreatedDiscordUser(
  userInfo,
  userId,
  username,
  avatar,
  email,
  access_token,
  refresh_token
) {
  userInfo.set('discordId', userId);
  userInfo.set('username', username);
  userInfo.set('avatar', avatar);
  userInfo.set('email', email);
  userInfo.set('discord_access_token', access_token);
  userInfo.set('discord_refresh_token', refresh_token);
  userInfo.set('is_discord_linked', true);
  return userInfo;
}

async function getUserObj(userId) {
  const userQuery = new Moralis.Query('UserInfo');
  const pipeline = [
    { match: { userId: userId } },
    {
      project: {
        discord_access_token: 0,
        discord_refresh_token: 0,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

Moralis.Cloud.define('linkDiscordUser', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.user) {
      throw 'User not Authenticated';
    }
    if (!request.params.code) {
      throw `No code provided`;
    }
    logger.info(`linkDiscordUser ${JSON.stringify(request.params)}`);
    const res = await Moralis.Cloud.httpRequest({
      url: 'https://spect-discord-bot.herokuapp.com/api/connectDiscord',
      params: {
        code: request.params.code,
      },
    });
    if (!res.data.userData.id) {
      throw 'Something went wrong while getting user data from discord';
    }
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      throw 'User not found in userinfo table';
    }
    userInfo = await getCreatedDiscordUser(
      userInfo,
      res.data.userData.id,
      res.data.userData.username,
      res.data.userData.avatar,
      res.data.userData.email,
      res.data.oauthData.access_token,
      res.data.oauthData.refresh_token
    );
    request.user.set('discordId', res.data.userData.id);
    request.user.set('username', res.data.userData.username);
    request.user.set('avatar', res.data.userData.avatar);
    await Moralis.Object.saveAll([userInfo, request.user], {
      useMasterKey: true,
    });
    // const userobj = await getUserObj(request.user.id);
    // return userobj[0];
    return true;
  } catch (err) {
    logger.error(`Error while creating user ${JSON.stringify(err)}`);
    return err;
  }
});

Moralis.Cloud.define('refreshDiscordUser', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.user) {
      throw 'User not Authenticated';
    }
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      throw 'User not found in userinfo table';
    }
    if (!userInfo.get('is_discord_linked')) {
      throw 'User has not linked his discord account';
    }
    logger.info(`refreshDiscordUser ${JSON.stringify(request.params)}`);
    const res = await Moralis.Cloud.httpRequest({
      url: 'https://spect-discord-bot.herokuapp.com/api/refreshDiscordUser',
      params: {
        refresh_token: userInfo.get('discord_refresh_token'),
      },
    });
    if (!res.data.userData.id) {
      throw 'Something went wrong while refreshing user data from discord';
    }
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      throw 'User not found in userinfo table';
    }
    userInfo = await getCreatedDiscordUser(
      userInfo,
      res.data.userData.id,
      res.data.userData.username,
      res.data.userData.avatar,
      res.data.userData.email,
      res.data.oauthData.access_token,
      res.data.oauthData.refresh_token
    );

    await Moralis.Object.saveAll([userInfo, request.user], {
      useMasterKey: true,
    });
    const userobj = await getUserObj(request.user.id);
    return userobj[0];
  } catch (err) {
    logger.error(`Error while creating user ${err}`);
    return err;
  }
});

Moralis.Cloud.define('linkDiscordToTribe', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (request.params.guild_id === 'undefined') {
      throw 'Guild id not provided';
    }
    const tribe = await getTribeByTeamId(request.params.teamId);
    tribe.set('guildId', request.params.guild_id);
    await Moralis.Object.saveAll([tribe], { useMasterKey: true });
    return true;
  } catch (err) {
    logger.error(
      `Error linking discord to tribe ${request.params.teamId}: ${err}`
    );
    return false;
  }
});
