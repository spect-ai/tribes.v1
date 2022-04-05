Moralis.Cloud.define("updateCard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.params.updates?.taskId) throw "Payload must contain taskId";

    var task = await getTaskByTaskId(request.params.updates?.taskId);
    validateUpdatePayload(request.params.updates, task, request.user.id);
    task = handleUpdates(request.params.updates, task);
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    return await getSpace(task.get("boardId"), request.user.id);
  } catch (err) {
    logger.error(
      `Error while updating task status with task Id ${request.params.updates?.taskId}: ${err}`
    );
    throw `${err}`;
  }
});

function validateUpdatePayload(updates, task, callerId) {
  if (!task) throw "Card not found";
  authorized(updates, task, callerId);
}

function authorized(updates, task, callerId) {
  if (
    updates.hasOwnProperty("title") ||
    updates.hasOwnProperty("description") ||
    updates.hasOwnProperty("status") ||
    updates.hasOwnProperty("reviewer") ||
    updates.hasOwnProperty("tags") ||
    updates.hasOwnProperty("reward") ||
    updates.hasOwnProperty("type") ||
    updates.hasOwnProperty("selectedProposals")
  ) {
    if (!(isTaskCreator(task, callerId) || isTaskReviewer(task, callerId)))
      throw "Only card creator or reviewer can update card";
  }
  if (updates.hasOwnProperty("submission")) {
    if (isTaskAssignee(task, callerId))
      throw "Only assignee can add submission";
  }
}

function handleUpdates(updates, task) {
  if (updates.hasOwnProperty("title")) {
    task.set("title", updates.title);
  }
  if (updates.hasOwnProperty("type")) {
    task.set("type", updates.type);
  }
  if (updates.hasOwnProperty("description")) {
    task.set("description", updates.description);
  }
  if (updates.hasOwnProperty("status")) {
    task.set("status", updates.status);
  }
  if (updates.hasOwnProperty("reviewer")) {
    task.set("reviewer", updates.reviewer);
  }
  if (updates.hasOwnProperty("assignee")) {
    task.set("assignee", updates.assignee);
  }
  if (updates.hasOwnProperty("tags")) {
    task.set("tags", updates.tags);
  }
  if (updates.hasOwnProperty("deadline")) {
    task.set("deadline", new Date(updates.deadline));
  }
  if (updates.hasOwnProperty("reward")) {
    task.set("value", parseFloat(updates.reward.value));
    task.set("token", updates.reward.token);
    task.set("chain", updates.reward.chain);
  }
  if (updates.hasOwnProperty("submission")) {
    task.set("submissions", [
      ...task.get("submissions"),
      { link: updates.submission.link, name: updates.submission.name },
    ]);
  }
  if (updates.hasOwnProperty("proposals")) {
    task.set("proposals", [
      ...task.get("proposals"),
      {
        from: callerId,
        title: updates.proposals.title,
        description: updates.proposals.description,
      },
    ]);
  }
  if (updates.hasOwnProperty("selectedProposals")) {
    task.set("selectedProposals", updates.selectedProposals);
  }
  return task;
}
