async function log(userId, message, level) {
  const config = await Moralis.Config.get({ useMasterKey: true });
  const env = config.get('env');
  if (env === 'developnment') {
    logExternally(userId, message, level);
  } else {
    logOnMoralis(userId, message, level);
  }
}

function logOnMoralis(userId, message, level) {
  const logger = Moralis.Cloud.getLogger();
  if (level === 'info') {
    logger.info(message);
  } else if (level === 'error') {
    logger.error(message);
  }
}

async function logExternally(userId, message, level) {
  const config = await Moralis.Config.get({ useMasterKey: true });

  const sema_token = config.get('sema_token');
  var url = `https://logsene-receiver.sematext.com/${sema_token}/example/`;

  var data = { userId: userId, message: message, level: level };

  Moralis.Cloud.httpRequest({
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  }).then(
    function (httpResponse) {
      // success
      logger.info(httpResponse.text);
    },
    function (httpResponse) {
      // error
      logger.error('Request failed with response code ' + httpResponse.status);
    }
  );
}
