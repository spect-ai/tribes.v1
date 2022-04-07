function handleBlockUpdate(task, blocks) {
  task.set("description", blocks);
  return task;
}

Moralis.Cloud.define("addBlockTaskDescription", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  var task = await getTaskByTaskId(request.params.taskId);
  try {
    task = handleBlockUpdate(task, request.params.blocks);
    logger.info(
      `Handled block update ${JSON.stringify(request.params.taskId)}`
    );
    await Moralis.Object.saveAll(task, { useMasterKey: true });
    logger.info(`Updated task ${JSON.stringify(task)}`);
    return true;
  } catch (err) {
    logger.error(
      `Error while updating blocks of task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating blocks ${err}`;
  }
});

Moralis.Cloud.define("getTaskDescription", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var task = await getTaskByTaskId(request.params.taskId);
    return {
      blocks: task.get("description"),
    };
  } catch (err) {
    logger.error(
      `Error while updating blocks of task Id ${request.params.taskId}: ${err}`
    );
    throw `Error while updating blocks ${err}`;
  }
});
