// These are all fields that can be directly updated without any pre-processing
const easyUpdates = [
  'title',
  'type',
  'description',
  'tags',
  'reviewer',
  'assignee',
  'chain',
  'token',
  'transactionHash',
];

// These are fields that need to converted to the date type
const dateUpdates = ['deadline'];

// These are fields that need to be converted to the integer type
const integerUpdates = ['status'];

// These are fields that need to be converted to the float type
const floatUpdates = ['value'];

// Array updates that require appends. One person can only create and edit one element (their own). Must be in the format: [{content: "",}]
const contentArrayUpdates = ['submissions', 'proposals'];

// Array updates that require appends and updates. One person can create multile elements and edit their own elements. Must be in the format: [{content: "",}]
const contentArrayMultiElementUpdates = ['comments'];

const datatypes = {
  title: 'string',
  type: 'string',
  reviewer: 'array',
  assignee: 'array',
  tags: 'array',
  chain: 'object',
  token: 'object',
  value: 'number',
  deadline: 'date',
  status: 'number',
  proposals: 'arrayOfObjects',
  selectedProposals: 'array',
  description: 'arrayOfObjects',
  submission: 'arrayOfObjects',
};

// Map of update property to action code
const updatePropertyActivityMap = {
  type: 99,
  reviewer: 106,
  assignee: 105,
  tags: 102,
  reward: 104,
  submission: 200,
  deadline: 101,
  status: {
    //
    created: 100,
    //assigned: 105,  // Not needed as payload will always contain assignee
    // review: 200,   // Not needed as payload will always contain assignee
    revision: 201,
    done: 205,
    paid: 300,
    archived: 500,
  },
  columnChange: 400,
};

Moralis.Cloud.define('updateCard', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.params.updates?.taskId) throw 'Payload must contain taskId';

    var task = await getTaskByTaskId(request.params.updates?.taskId);
    var space = await getBoardByObjectId(task.get('boardId'));

    validate(request.params.updates, task, request.user.id, space);
    [space, task] = await handleUpdates(
      request.params.updates,
      task,
      space,
      request.user.id
    );
    const res = await Moralis.Object.saveAll([space, task], {
      useMasterKey: true,
    });

    var resTask = addFieldsToTask(
      mapParseObjectToObject(res[1]),
      request.user.id
    );

    // Arrange comments so oldest is first
    resTask.comments = resTask.comments?.sort((a, b) =>
      dateGreaterThan(a.createdAt, b.createdAt) ? 1 : -1
    );
    return {
      space: await getSpace(task.get('boardId'), request.user.id),
      task: resTask,
    };
  } catch (err) {
    logger.error(
      `Error while updating card with card Id ${request.params.updates?.taskId}: ${err}`
    );
    throw `${err}`;
  }
});

Moralis.Cloud.define('updateMultipleCards', async (request) => {
  try {
    var tasks = await getTasksByTaskIds(Object.keys(request.params.updates));
    if (tasks.length === 0) throw 'No tasks found';
    var space = await getBoardByObjectId(tasks[0].get('boardId'));
    var resTasks = [];
    for (var task of tasks) {
      validate(
        request.params.updates[task.get('taskId')],
        task,
        request.user.id,
        space
      );
      [space, task] = await handleUpdates(
        request.params.updates[task.get('taskId')],
        task,
        space,
        request.user.id
      );
      resTasks.push(task);
    }
    const res = await Moralis.Object.saveAll(resTasks.concat([space]), {
      useMasterKey: true,
    });
    return {
      space: await getSpace(task.get('boardId'), request.user.id),
      tasks: resTasks.map((task) =>
        addFieldsToTask(mapParseObjectToObject(task), request.user.id)
      ),
    };
  } catch (err) {
    logger.error(
      `Error while updating cards with card Id ${request.params.updates?.taskId}: ${err}`
    );
    throw `${err}`;
  }
});

function validate(updates, task, callerId, space) {
  if (!task) throw 'Card not found';
  authorized(updates, task, callerId, space);
  validatePayload(updates, task);
}

function authorized(updates, task, callerId, space) {
  if (
    updates.hasOwnProperty('title') ||
    updates.hasOwnProperty('description') ||
    updates.hasOwnProperty('reviewer') ||
    updates.hasOwnProperty('tags') ||
    updates.hasOwnProperty('reward') ||
    updates.hasOwnProperty('type')
  ) {
    if (
      !(
        isTaskCreator(task, callerId) ||
        isTaskReviewer(task, callerId) ||
        (space.get('roles').hasOwnProperty(callerId) &&
          space.get('roles')[callerId] === 3)
      )
    )
      throw 'Only card creator, reviewer and space steward can update card info';
  }
  if (updates.hasOwnProperty('submissions')) {
    if (!isTaskAssignee(task, callerId))
      throw 'Only assignee can add submission';
  }
  if (updates.hasOwnProperty('comments')) {
    if (
      !(
        isTaskCreator(task, callerId) ||
        isTaskReviewer(task, callerId) ||
        isTaskAssignee(task, callerId) ||
        space.get('roles').hasOwnProperty(callerId)
      )
    )
      throw 'Only card creator, reviewer, assignee and space steward can add comments';
  }

  if (updates.hasOwnProperty('status')) {
    if (updates.status === 105) {
      if (
        task.type === 'Bounty' &&
        !(
          isTaskReviewer(task, callerId) ||
          isTaskCreator(task, callerId) ||
          space.get('roles')[callerId] === 3
        )
      )
        throw 'Only card reviewer, creator and space steward can assign bounty';
      else if (
        task.type === 'Task' &&
        [1, 2, 3].includes(space.get('roles')[callerId])
      )
        throw 'Only space member can assign task';
    } else if (updates.status === 200) {
      if (!isTaskAssignee(task, callerId))
        throw 'Only card assignee can ask for a review';
    } else if (updates.status === 201) {
      if (
        !(
          isTaskReviewer(task, callerId) ||
          isTaskCreator(task, callerId) ||
          space.get('roles')[callerId] === 3
        )
      )
        throw 'Only card creator, reviewer and space steward can ask for revision';
    } else if (updates.status === 205) {
      if (
        !(
          isTaskReviewer(task, callerId) ||
          isTaskCreator(task, callerId) ||
          space.get('roles')[callerId] === 3
        )
      )
        throw 'Only card creator, reviewer and space steward can close card';
    } else if (updates.status === 300) {
      if (
        !(
          isTaskReviewer(task, callerId) ||
          isTaskCreator(task, callerId) ||
          space.get('roles')[callerId] === 3
        )
      )
        throw 'Only card creator, reviewer and space steward can set card as paid';
    } else if (updates.status === 500) {
      if (
        !(
          isTaskReviewer(task, callerId) ||
          isTaskCreator(task, callerId) ||
          space.get('roles')[callerId] === 3
        )
      )
        throw 'Only card creator, reviewer and space steward can archive card';
    }
  }

  /* TODO: Need to think about this
  if (updates.hasOwnProperty("assignee")) {
    if (
      !(
        isTaskCreator(task, callerId) ||
        isTaskReviewer(task, callerId) ||
        (space.roles[callerId] && space.roles[callerId] === 3) ||
        (task.assignee.length > 0 && isTaskAssignee(task, callerId)) ||
        (task.type === "Task" &&
          task.assignee.length === 0 &&
          callerId === updates.assignee[0])
      )
    )
      throw "Only card creator, reviewer and space steward can update assignee";
  }*/
}

function validatePayload(updates, task) {
  if (updates.hasOwnProperty('columnChange')) {
    if (
      !updates.columnChange.hasOwnProperty('sourceId') ||
      !updates.columnChange.hasOwnProperty('destinationId')
    )
      throw 'Payload must contain sourceId and destinationId';
  }
}

async function handleUpdates(updates, task, space, callerId) {
  task = handleActivityUpdates(task, updates, callerId);
  task = handleEasyFieldUpdates(task, updates, easyUpdates);
  task = handleDateUpdates(task, updates, dateUpdates);
  task = handleIntegerUpdates(task, updates, integerUpdates);
  task = handleFloatUpdates(task, updates, floatUpdates);
  task = handleContentArrayUpdate(task, updates, callerId, contentArrayUpdates);
  task = handleContentArrayMultiElementUpdate(
    task,
    updates,
    callerId,
    contentArrayMultiElementUpdates
  );
  if (updates.hasOwnProperty('columnChange')) {
    [space, task] = await handleColumnUpdate(space, task, updates);
    //[space, task] = await handleReverseAutomation(space, task, updates);
  } else {
    [space, task] = await handleAutomation(task, updates, space);
  }
  return [space, task];
}

function removeTaskFromColumn(column, taskId) {
  const index = column.taskIds.indexOf(taskId);
  const taskIds = Array.from(column.taskIds); // copy
  taskIds.splice(index, 1);
  return {
    ...column,
    taskIds: taskIds,
  };
}

function addTaskToColumn(column, taskId, index) {
  const taskIds = Array.from(column.taskIds); // copy
  if (index < 0 || index > taskIds.length || (!index && index !== 0)) {
    index = taskIds.length;
  }

  taskIds.splice(index, 0, taskId);
  return {
    ...column,
    taskIds: taskIds,
  };
}

async function handleColumnUpdate(space, task, updates) {
  const sourceId = updates.columnChange.sourceId;
  const destinationId = updates.columnChange.destinationId;
  logger.info(
    `Handling column update for task ${space.id} ${task.get(
      'taskId'
    )} ${sourceId} ${destinationId}`
  );
  var columns = space.get('columns');
  const source = removeTaskFromColumn(columns[sourceId], task.get('taskId'));
  logger.info(`source: ${JSON.stringify(source)}`);

  const destination = addTaskToColumn(
    columns[destinationId],
    task.get('taskId')
  );

  columns = {
    ...columns,
    [source.id]: source,
    [destination.id]: destination,
  };
  space.set('columns', columns);
  task.set('columnId', destinationId);

  return [space, task];
}

function handleContentArrayUpdate(task, updates, callerId, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      if (task.get(key)) {
        // Get user's existing proposal
        var existingIndex = task
          .get(key)
          .findIndex((obj) => obj.userId === callerId);
        logger.info(`existingIndex: ${JSON.stringify(existingIndex)}`);
        if (existingIndex !== -1) {
          // User has already submitted a proposal
          const updatedObj = {
            id: task.get(key)[existingIndex].id,
            userId: callerId,
            content: value.content,
            createdAt: task.get(key)[existingIndex].createdAt,
            updatedAt: new Date(),
            edited: true,
          };
          task.get(key).splice(existingIndex, 1);
          task.set(key, [...task.get(key), updatedObj]);
        } else {
          // User has not submitted a proposal yet
          task.set(key, [
            ...task.get(key),
            {
              id: crypto.randomUUID(),
              userId: callerId,
              content: value.content,
              createdAt: new Date(),
              updatedAt: new Date(),
              edited: false,
            },
          ]);
        }
      } else {
        // Proposal field is null or undefined (for smooth backward compatibility)
        task.set(key, [
          {
            id: crypto.randomUUID(),
            userId: callerId,
            content: value.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            edited: false,
          },
        ]);
      }
    }
  }

  return task;
}

function handleContentArrayMultiElementUpdate(task, updates, callerId, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      if (value.mode === 'add') {
        // User is creating new element
        if (task.get(key)) {
          task.set(key, [
            ...task.get(key),
            {
              id: crypto.randomUUID(),
              userId: callerId,
              content: value.content,
              createdAt: new Date(),
              updatedAt: new Date(),
              edited: false,
            },
          ]);
        } else {
          // This takes care of the case where the field is null or undefined (for smooth backward compatibility)
          task.set(key, [
            {
              id: crypto.randomUUID(),
              userId: callerId,
              content: value.content,
              createdAt: new Date(),
              updatedAt: new Date(),
              edited: false,
            },
          ]);
        }
      } else if (value.mode === 'edit') {
        var existingIndex = task
          .get(key)
          .findIndex((obj) => obj.id === value.id && obj.userId === callerId);
        if (existingIndex !== -1) {
          // User has indeed created an element with the given id
          const updatedObj = {
            id: value.id,
            userId: callerId,
            content: value.content,
            updatedAt: new Date(),
            createdAt: task.get(key)[existingIndex].createdAt,
            edited: true,
          };
          task.get(key).splice(existingIndex, 1);
          task.set(key, [...task.get(key), updatedObj]);
        } else {
          // User has not created an element with the given id
          throw 'Resource not found or caller does not have permission to update it';
        }
      } else if (value.mode === 'delete') {
        var existingIndex = task
          .get(key)
          .findIndex((obj) => obj.id === value.id && obj.userId === callerId);
        if (existingIndex !== -1) {
          // User has indeed created an element with the given id
          task.get(key).splice(existingIndex, 1);
        } else {
          // User has not created an element with the given id
          throw 'Resource not found or caller does not have permission to update it';
        }
      }
    }
  }

  return task;
}

function handleEasyFieldUpdates(task, updates, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      task.set(key, value);
    }
  }
  return task;
}

function handleDateUpdates(task, updates, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      task.set(key, new Date(value));
    }
  }
  return task;
}

function handleIntegerUpdates(task, updates, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      task.set(key, parseInt(value));
    }
  }
  return task;
}

function handleFloatUpdates(task, updates, fields) {
  for (const [key, value] of Object.entries(updates)) {
    if (fields.includes(key)) {
      task.set(key, parseFloat(value));
    }
  }
  return task;
}

function handleActivityUpdate(task, updates, property, callerId) {
  updates.action = updatePropertyActivityMap[property];
  updates.actor = callerId;
  updates.timestamp = new Date();
  updates.taskType = task.get('type');
  updates.changeLog = { prev: task.get(property), next: updates[property] };
  if (task.get('activity'))
    task.set('activity', [...task.get('activity'), updates]);
  else task.set('activity', [updates]);

  return task;
}

function determineLogFieldForStatusActivityUpdate(status) {
  status === 105
    ? 'assignee'
    : status === 200 || status === 201 || status === 205
    ? 'submission'
    : status === 300
    ? 'transactionHash'
    : '';
}

function handleStatusActivityUpdate(task, updates, callerId, statusCode) {
  const logField = determineLogFieldForStatusActivityUpdate(statusCode);
  if ([200, 201, 205, 300, 500].includes(statusCode)) {
    updates.action = parseInt(statusCode);
    updates.actor = callerId;
    updates.timestamp = new Date();
    updates.taskType = task.get('type');
    updates.changeLog = {
      prev: { status: task.get('status'), field: task.get(logField) },
      next: { status: updates['status'], field: updates[logField] },
    };
    if (task.get('activity'))
      task.set('activity', [...task.get('activity'), updates]);
    else task.set('activity', [updates]);
  }
  return task;
}

function handleActivityUpdates(task, updates, callerId) {
  var reward = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'status') {
      handleStatusActivityUpdate(task, updates, callerId, value);
    } else if (updatePropertyActivityMap.hasOwnProperty(key)) {
      task = handleActivityUpdate(task, updates, key, callerId);
    }
  }
  return task;
}

async function handleAutomation(task, updates, space) {
  let column;
  if (updates.status === 200) {
    column = Object.values(space.get('columns')).find(
      (column) => column.title === 'In Review'
    );
  } else if (updates.status === 201) {
    column = Object.values(space.get('columns')).find(
      (column) => column.title === 'In Progress'
    );
  } else if ([205, 300, 500].includes(updates.status)) {
    column = Object.values(space.get('columns')).find(
      (column) => column.title === 'Done'
    );
  }

  // task.get is added for smooth backward compatibility
  if (column && task.get('columnId')) {
    if (column.id === task.get('columnId')) {
      logger.info(`task ${task.get('taskId')} already in review column`);
    } else {
      updates.columnChange = {
        sourceId: task.get('columnId'),
        destinationId: column.id,
      };
      [space, task] = await handleColumnUpdate(space, task, updates);
    }
  }
  return [space, task];
}

function isDifferentEasyField(task, updates, key) {
  if (datatypes[key] === 'array') {
    return !arrayHasSameElements(task.get(key), updates[key]);
  } else {
    return task.get(key) !== updates[key];
  }
}

function isDifferentReward(task, updates) {
  return (
    task.get('value') !== updates.reward.value ||
    !objectHasSameElements(task.get('chain'), updates.reward.chain) ||
    !objectHasSameElements(task.get('token'), updates.reward.token)
  );
}

function isDifferentDeadline(task, updates) {
  return task.get('deadline') !== new Date(updates.deadline);
}
