Moralis.Cloud.define('getTask', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  log(
    request.user?.id,
    'Calling getTask with params: ' + JSON.stringify(request.params),
    'info'
  );
  try {
    if (request.params.taskId) {
      var task = await getTaskObjByTaskId(request.params.taskId);
      if (!task) {
        throw `Task ${request.params.taskId} not found`;
      }

      // Get space to check if user can view it
      const space = await getBoardObjByObjectId(task.boardId, request.user?.id);
      const canReadSpace = canRead(space[0], request.user?.id);
      if (!canReadSpace) {
        throw 'You dont have access to view this space';
      }

      task = addFieldsToTask(task, request.user?.id);
      task.activity.reverse();
      // Arrange comments so oldest is first
      task.comments = task.comments?.sort((a, b) =>
        dateGreaterThan(a.createdAt, b.createdAt) ? 1 : -1
      );

      return task;
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in getTask for taskId ${request.params.taskId}: ${err}`,
      'error'
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
