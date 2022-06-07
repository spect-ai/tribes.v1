Moralis.Cloud.define('linkGithubUser', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Calling linkGithubUser for userId: ${request.user.id}`
  );

  try {
    if (!request.user) {
      throw 'User not Authenticated';
    }
    if (!request.params.code & !request.params.state) {
      throw `Missing : code or state params`;
    }
    if (request.params.state != request.user.id) {
      throw `Attention : Cross-site request`;
    }

    logger.info('Callback to get github Id');
    
    const res = await Moralis.Cloud.httpRequest({
      url: 'https://github-auth-spect.herokuapp.com/callback',
      params: {
        code: request.params.code,
      },
    });
    
    logger.info({res});

    if (!res.data.github) {
      throw 'Something went wrong while getting user data from github';
    }
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      throw 'User not found in userinfo table';
    }
    userInfo.set('githubId', res.data.github);
    userInfo.set('is_github_linked', true);
    request.user.set('githubId', res.data.github);

    await Moralis.Object.saveAll([userInfo, request.user], {
      useMasterKey: true,
    });
    
    return true;
  }catch(error) {
    logger.error(`Error while linking github user ${error}`);
    return error;
  }
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
    const repoArray = request.params.repo.split(',');
    const spaceId = request.params.spaceId;
    var space = await getBoardByObjectId(spaceId);

    if (repoArray.length) {
      space.set('githubRepos', repoArray);
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



