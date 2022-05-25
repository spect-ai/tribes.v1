Moralis.Cloud.define('getGithubToken', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  return Moralis.Cloud.httpRequest({
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    params: {
      client_id: '4403e769e4d52b24eeab',
      client_secret: 'f525458baff411277086d660ace07b0a4b40af3d',
      code: request.params.code,
      redirect_uri: 'http://localhost:3000/',
    },
  })
    .then((httpResponse) => httpResponse.text)
    .catch((error) => {
      logger.info(error);
      throw `Error while getting Github token ${error}`;
    });
});

Moralis.Cloud.define('githubUpdateCard', async (request) => {
  log(
    request.params.user,
    `Calling updateCard for taskId: ${request.params.taskIds}`,
    'info'
  );
  const taskIds = request.params.taskIds.split(',');
  let comment;
  try {
    for (taskId of taskIds) {
      logger.info(`Updating card for taskId: ${taskId}`);
      var task = await getTaskByTaskId(taskId);

      if (task) {
        var space = await getBoardByObjectId(task.get('boardId'));
        var link = String(request.params.link);
        var status = Number(request.params.updates?.status);

        if (status == 200) {
          task.add('submissions', {
            id: crypto.randomUUID(),
            userId: 'Bot',
            content: [
              {
                id: crypto.randomUUID(),
                html: '/e',
                tag: 'embed',
                type: 'pr',
                imageUrl: '',
                embedUrl: link,
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            edited: true,
          });
        }

        [space, task] = await handleAutomation(
          task,
          request.params.updates,
          space
        );
        task.set('status', status);
        task = handleActivityUpdates(task, request.params.updates, 'Bot');
        const res = await Moralis.Object.saveAll([space, task], {
          useMasterKey: true,
        });
        logger.info(`res: ${JSON.stringify(res)}`);

        comment = 'Your submission was successful.';
      } else {
        comment = 'looks like you have given the incorrect Task ID.';
        break;
      }
    }
    return comment;
  } catch (error) {
    log(
      `Failure in updateCard for card id ${request.params.taskIds}: ${err}`,
      'error'
    );
    throw error;
  }
});

Moralis.Cloud.define('connectGithubRepo', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Calling connectGithubRepo for spaceId: ${request.params.spaceId}`
  );
  try {
    const repoArray = [request.params.repo];
    const spaceId = request.params.spaceId;
    var space = await getBoardByObjectId(spaceId);

    if (repoArray.length){
      space.set('github',repoArray);
      const res = await Moralis.Object.saveAll(space, {
        useMasterKey: true,
      });
      logger.info(`res: ${JSON.stringify(res)}`);
    }
    var tribe = space.get('teamId');
    return tribe;

  } catch (error) {
    logger.error(
      `Failure in connectGithubRepo for spaceId: ${request.params.spaceId} : ${err}`,
      'error'
    );
    throw error;
  }
});