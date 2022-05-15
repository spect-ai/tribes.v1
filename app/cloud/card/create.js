Moralis.Cloud.define('addTask', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  log(
    request.user?.id,
    `Calling addTask on space ${request.params.boardId}`,
    'info'
  );
  const board = await getBoardByObjectId(request.params.boardId);
  const tribe = await getTribeByTeamId(board.get('teamId'));
  try {
    if (isMember(request.user.id, board)) {
      var columns = board.get('columns');
      const numTasks = await getTaskCountInBoard(request.params.boardId);
      const taskId = `task-${request.params.boardId}-${numTasks + 1}`;
      var taskIds = columns[request.params.columnId].taskIds;
      columns[request.params.columnId].taskIds = taskIds.concat([taskId]);
      board.set('columns', columns);

      const payment =
        request.params.value !== '0'
          ? { chain: request.params.chain, token: request.params.token }
          : board.get('defaultPayment');
      var task = new Moralis.Object('Task');
      task = handleCreateTask(
        task,
        taskId,
        payment,
        request.params.boardId,
        request.params.title,
        request.params.value,
        request.user.id,
        request.params.reviewer,
        request.params.type
          ? request.params.type
          : columns[request.params.columnId].defaultCardType,
        request.params.columnId,
        request.params.tags,
        request.params.description,
        request.params.assignee,
        request.params.deadline
      );
      logger.info(`Creating task ${JSON.stringify(task)}`);
      // await Moralis.Object.saveAll([task], { useMasterKey: true }); why save separately??
      await Moralis.Object.saveAll([board, task], { useMasterKey: true });
      const res = {};
      const space = await getSpace(request.params.boardId, request.user.id);
      res.space = space;
      res.taskId = taskId;
      const channels = columns[request.params.columnId].discordChannels;
      if (channels && channels.length > 0) {
        logger.info(`Sending message to channels ${channels}`);
        NotifyOnDiscord(board, tribe.get('guildId'), taskId, channels);
      }
      return res;
    } else {
      throw 'User doesnt have access to create task';
    }
  } catch (err) {
    log(
      request.user?.id,
      `Failure in addTask for space id ${request.params.boardId}: ${err}`,
      'error'
    );
    throw `${err}`;
  }
});

function handleCreateTask(
  task,
  taskId,
  payment,
  boardId,
  title,
  value,
  callerId,
  reviewerId,
  cardType,
  columnId,
  tags,
  description,
  assigneeId,
  deadline
) {
  task.set('taskId', taskId);
  task.set('token', {
    address: payment?.token?.address,
    symbol: payment?.token?.symbol,
  });
  task.set('chain', {
    chainId: payment?.chain?.chainId,
    name: payment?.chain?.name,
  });
  task.set('boardId', boardId);
  task.set('title', title);
  task.set('value', parseFloat(value));
  task.set('creator', callerId);
  reviewerId && reviewerId !== ''
    ? task.set('reviewer', [reviewerId])
    : task.set('reviewer', []);
  assigneeId && assigneeId !== ''
    ? task.set('assignee', [assigneeId])
    : task.set('assignee', []);
  task.set('status', 100);
  tags ? task.set('tags', tags) : task.set('tags', []);
  if (description) task.set('description', description);
  task.set('columnId', columnId);
  assigneeId && assigneeId !== ''
    ? task.set('status', 100)
    : task.set('status', 105);
  cardType ? task.set('type', cardType) : task.set('type', 'Task');
  if (deadline) task.set('deadline', new Date(deadline));

  var activity = [];
  activity.push({
    action: 100,
    actor: callerId,
    timestamp: new Date(),
    taskType: cardType ? cardType : 'Task',
    changeLog: { prev: null, next: cardType ? cardType : 'Task' },
  });
  if (assigneeId && assigneeId !== '') {
    activity.push({
      action: 105,
      actor: callerId,
      timestamp: new Date(),
      taskType: cardType ? cardType : 'Task',
      changeLog: { prev: null, next: [assigneeId] },
    });
  }
  task.set('activity', activity);
  return task;
}
