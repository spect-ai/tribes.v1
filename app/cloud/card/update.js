// These are all fields that can be directly updated without any pre-processing
const easyUpdates = [
  "title",
  "type",
  "description",
  "tags",
  "reviewer",
  "assignee",
  "chain",
  "token",
  "transactionHash",
];

// These are fields that need to converted to the date type
const dateUpdates = ["deadline"];

// These are fields that need to be converted to the integer type
const integerUpdates = ["status"];

// These are fields that need to be converted to the float type
const floatUpdates = ["value"];

// Array updates that require appends. One person can only create and edit one element (their own). Must be in the format: [{content: "",}]
const contentArrayUpdates = ["submissions", "proposals"];

// Array updates that require appends and updates. One person can create multile elements and edit their own elements. Must be in the format: [{content: "",}]
const contentArrayMultiElementUpdates = ["comments"];

const datatypes = {
  title: "string",
  type: "string",
  reviewer: "array",
  assignee: "array",
  tags: "array",
  chain: "object",
  token: "object",
  value: "number",
  deadline: "date",
  status: "number",
  proposals: "arrayOfObjects",
  selectedProposals: "array",
  description: "arrayOfObjects",
  submission: "arrayOfObjects",
};

// Map of update property to action code
const updatePropertyActivityMap = {
  type: 99,
  reviewer: 106,
  assignee: 105,
  tags: 102,
  reward: 104,
  submission: 200,
  status: {
    //
    review: 200,
    revision: 201,
    done: 205,
    paid: 300,
  },
  columnChange: 400,
  selectedProposals: 152,
};

Moralis.Cloud.define("updateCard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.params.updates?.taskId) throw "Payload must contain taskId";

    var task = await getTaskByTaskId(request.params.updates?.taskId);
    const space = await getSpace(task.get("boardId"), request.user.id);

    validate(request.params.updates, task, request.user.id, space);
    task = await handleUpdates(request.params.updates, task, request.user.id);
    const res = await Moralis.Object.saveAll(task, { useMasterKey: true });
    return {
      space: await getSpace(task.get("boardId"), request.user.id),
      task: addFieldsToTask(mapParseObjectToObject(res), request.user.id),
    };
  } catch (err) {
    logger.error(
      `Error while updating task status with task Id ${request.params.updates?.taskId}: ${err}`
    );
    throw `${err}`;
  }
});

function validate(updates, task, callerId, space) {
  if (!task) throw "Card not found";
  authorized(updates, task, callerId, space);
  validatePayload(updates, task);
}

function authorized(updates, task, callerId, space) {
  if (
    updates.hasOwnProperty("title") ||
    updates.hasOwnProperty("description") ||
    updates.hasOwnProperty("reviewer") ||
    updates.hasOwnProperty("tags") ||
    updates.hasOwnProperty("reward") ||
    updates.hasOwnProperty("type") ||
    updates.hasOwnProperty("selectedProposals") ||
    updates.hasOwnProperty("status")
  ) {
    if (
      !(
        isTaskCreator(task, callerId) ||
        isTaskReviewer(task, callerId) ||
        (space.roles[callerId] && space.roles[callerId] === 3)
      )
    )
      throw "Only card creator, reviewer and space steward can update card info";
  }
  if (updates.hasOwnProperty("submission")) {
    if (!isTaskAssignee(task, callerId))
      throw "Only assignee can add submission";
  }
  if (updates.hasOwnProperty("comments")) {
    if (
      !(
        isTaskCreator(task, callerId) ||
        isTaskReviewer(task, callerId) ||
        isTaskAssignee(task, callerId) ||
        space.roles.hasOwnProperty(callerId)
      )
    )
      throw "Only card creator, reviewer, assignee and space steward can add comments";
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
  if (updates.hasOwnProperty("columnChange")) {
    if (
      !updates.columnChange.hasOwnProperty("sourceId") ||
      !updates.columnChange.hasOwnProperty("destinationId")
    )
      throw "Payload must contain sourceId and destinationId";
  }
}

async function handleUpdates(updates, task, callerId) {
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
  task = handleSelectedProposalUpdate(task, updates);
  handleColumnUpdate(task.get("boardId"), task.get("taskId"), updates, task);
  return task;
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

function addTaskToColumn(column, taskId) {
  const taskIds = Array.from(column.taskIds); // copy
  taskIds.push(taskId);
  return {
    ...column,
    taskIds: taskIds,
  };
}

async function handleColumnUpdate(boardId, taskId, updates, task) {
  if (updates.hasOwnProperty("columnChange")) {
    const sourceId = updates.columnChange.sourceId;
    const destinationId = updates.columnChange.destinationId;
    const logger = Moralis.Cloud.getLogger();
    try {
      const board = await getBoardByObjectId(boardId);

      logger.info(
        `Handling column update for task ${boardId} ${taskId} ${sourceId} ${destinationId}`
      );
      var columns = board.get("columns");
      const newSource = removeTaskFromColumn(columns[sourceId], taskId);
      logger.info(`newSource: ${JSON.stringify(newSource)}`);

      const newDestination = addTaskToColumn(columns[destinationId], taskId);
      logger.info(`newDestination: ${JSON.stringify(newDestination)}`);

      columns = {
        ...columns,
        [newSource.id]: newSource,
        [newDestination.id]: newDestination,
      };
      logger.info(`columns: ${JSON.stringify(columns)}`);
      board.set("columns", columns);
      task.set("columnId", destinationId);
      return await Moralis.Object.saveAll([board, task], {
        useMasterKey: true,
      });
    } catch (err) {
      throw `${err}`;
    }
  }
}

function handleSelectedProposalUpdate(task, updates) {
  if (updates.hasOwnProperty("selectedProposals")) {
    const proposalIdx = task
      .get("proposals")
      .findIndex((p) => p.id === updates.selectedProposals[0]);
    if (proposalIdx === -1) throw "Proposal not found";
    else {
      task.set("selectedProposals", updates.selectedProposals);
      task.set("assignee", [task.get("proposals")[proposalIdx].userId]);
      updates.selectedApplicant = task.get("proposals")[proposalIdx].userId;
    }
  }
  return task;
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
            lastUpdated: new Date(),
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
              lastUpdated: new Date(),
            },
          ]);
        }
      } else {
        // Proposal field is null or undefined (for smooth backward compatibility)
        task.set(key, [
          {
            id: crypto.randomUUID(),
            userId: callerId,
            description: updates.content,
          },
        ]);
      }
    }
  }

  return task;
}

function handleContentArrayMultiElementUpdate(task, updates, callerId, fields) {
  for (const [key, value] of Object.entries(updates)) {
    logger.info(`value: ${JSON.stringify(value)}`);
    if (fields.includes(key)) {
      if (value.mode === "add") {
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
      } else if (value.mode === "edit") {
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
          throw "Resource not found or caller does not have permission to update it";
        }
      } else if (value.mode === "delete") {
        var existingIndex = task
          .get(key)
          .findIndex((obj) => obj.id === value.id && obj.userId === callerId);
        if (existingIndex !== -1) {
          // User has indeed created an element with the given id
          task.get(key).splice(existingIndex, 1);
        } else {
          // User has not created an element with the given id
          throw "Resource not found or caller does not have permission to update it";
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
  updates.taskType = task.get("type");
  updates.changeLog = { prev: task.get(property), next: updates[property] };
  if (task.get("activity"))
    task.set("activity", [...task.get("activity"), updates]);
  else task.set("activity", [updates]);

  return task;
}

function handleStatusActivityUpdate(task, updates, callerId, statusCode) {
  updates.action = parseInt(statusCode);
  updates.actor = callerId;
  updates.timestamp = new Date();
  updates.taskType = task.get("type");
  updates.changeLog = { prev: task.get("status"), next: updates["status"] };
  if (task.get("activity"))
    task.set("activity", [...task.get("activity"), updates]);
  else task.set("activity", [updates]);
  return task;
}

function handleActivityUpdates(task, updates, callerId) {
  var reward = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === "status") {
      handleStatusActivityUpdate(task, updates, callerId, value);
    } else if (updatePropertyActivityMap.hasOwnProperty(key)) {
      task = handleActivityUpdate(task, updates, key, callerId);
    }
  }
  return task;
}

function isDifferentEasyField(task, updates, key) {
  if (datatypes[key] === "array") {
    return !arrayHasSameElements(task.get(key), updates[key]);
  } else {
    return task.get(key) !== updates[key];
  }
}

function isDifferentReward(task, updates) {
  return (
    task.get("value") !== updates.reward.value ||
    !objectHasSameElements(task.get("chain"), updates.reward.chain) ||
    !objectHasSameElements(task.get("token"), updates.reward.token)
  );
}

function isDifferentDeadline(task, updates) {
  return task.get("deadline") !== new Date(updates.deadline);
}

function arrayHasSameElements(array1, array2) {
  logger.info(`array1: ${JSON.stringify(array1)}`);
  logger.info(`array2: ${JSON.stringify(array2)}`);
  if (array1?.length !== array2?.length) return false;
  for (const element of array1) {
    if (!array2.includes(element)) return false;
  }
  return true;
}

function objectHasSameElements(obj1, obj2) {
  logger.info(`obj1: ${JSON.stringify(obj1)}`);
  logger.info(`obj2: ${JSON.stringify(obj2)}`);
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  for (const key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}
