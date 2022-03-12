Moralis.Cloud.define("getGithubToken", async (request) => {
  const logger = Moralis.Cloud.getLogger();
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
    .catch((error) => {
      logger.info(error);
      throw `Error while getting Github token ${error}`;
    });
});
