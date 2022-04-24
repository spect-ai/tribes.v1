Moralis.Cloud.define('getTask', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (request.params.taskId) {
      var task = await getTaskObjByTaskId(request.params.taskId);
      if (!task) throw `Task ${request.params.taskId} not found`;

      // Get space to check if user can view it
      const space = await getBoardObjByObjectId(task.boardId, request.user?.id);
      const canReadSpace = canRead(space[0], request.user?.id);
      if (!canReadSpace) throw 'You dont have access to view this space';

      task = addFieldsToTask(task, request.user?.id);
      task.activity.reverse();
      if (task.comments?.legnth > 0) {
        logger.info(
          `date1 ${JSON.stringify(
            new Date(task.comments[0]?.createdAt?.iso)?.getTime()
          )}`
        );
      }
      // Arrange comments so oldest is first
      task.comments = task.comments?.sort((a, b) =>
        dateGreaterThan(a.createdAt, b.createdAt) ? 1 : -1
      );

      return task;
    }
  } catch (err) {
    logger.error(
      `Error while getting task from board ${request.params.taskId}: ${err}`
    );
    throw err;
  }
});

function getViewableProposals(proposals, taskAccess, callerId) {
  if (!proposals) return [];
  if (!(taskAccess.creator || taskAccess.reviewer)) {
    return proposals.filter((proposal) => {
      return proposal.userId === callerId;
    });
  } else {
    return proposals;
  }
}

function addFieldsToTask(task, callerId) {
  // Get access level of caller
  const access = getCardAccess(task, callerId);
  task.access = access;

  // Get proposals that can be viewed by user
  task.numProposals = task.proposals?.length;
  task.proposals = getViewableProposals(task.proposals, task.access, callerId);

  return task;
}
