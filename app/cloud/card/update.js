Moralis.Cloud.define("updateCard", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (!request.params.updates?.taskId) throw "Payload must contain taskId";

    var task = await getTaskByTaskId(request.params.updates?.taskId);
    validateUpdatePayload(request.params.updates, task, request.user.id);
    task = await handleUpdates(request.params.updates, task, request.user.id);
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
  validateColumnChangePayload(updates, task);
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

function validateColumnChangePayload(updates, task) {
  if (updates.hasOwnProperty("columnChange")) {
    if (
      !updates.columnChange.hasOwnProperty("sourceId") ||
      !updates.columnChange.hasOwnProperty("destinationId")
    )
      throw "Payload must contain sourceId and destinationId";
  }
}

async function handleUpdates(updates, task, callerId) {
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
  if (updates.hasOwnProperty("proposal")) {
    task = handleProposalUpdate(task, updates, callerId);
  }

  if (updates.hasOwnProperty("selectedProposals")) {
    const proposalIdx = task
      .get("proposals")
      .findIndex((p) => p.id === updates.selectedProposals[0]);
    if (proposalIdx === -1) throw "Proposal not found";
    else {
      task.set("selectedProposals", updates.selectedProposals);
      task.set("assignee", [task.get("proposals")[proposalIdx].userId]);
    }
  }
  if (updates.hasOwnProperty("columnChange")) {
    const response = await handleColumnUpdate(
      task.get("boardId"),
      task.get("taskId"),
      updates.columnChange.sourceId,
      updates.columnChange.destinationId
    );
  }
  return task;
}

async function handleColumnUpdate(boardId, taskId, sourceId, destinationId) {
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
    return await Moralis.Object.saveAll([board], { useMasterKey: true });
  } catch (err) {
    throw `${err}`;
  }
}

function handleProposalUpdate(task, updates, callerId) {
  if (task.get("proposals")) {
    var existingProposalIndex = task
      .get("proposals")
      .findIndex((proposal) => proposal.userId === callerId);
    logger.info(
      `existingProposalIndex: ${JSON.stringify(existingProposalIndex)}`
    );
    if (existingProposalIndex !== -1) {
      // User has already submitted a proposal
      const updatedProposal = {
        id: task.get("proposals")[existingProposalIndex].id,
        userId: callerId,
        description: updates.proposal.description,
        lastUpdated: new Date(),
      };
      task.get("proposals").splice(existingProposalIndex, 1);
      task.set("proposals", [...task.get("proposals"), updatedProposal]);
    } else {
      // User has not submitted a proposal yet
      task.set("proposals", [
        ...task.get("proposals"),
        {
          id: crypto.randomUUID(),
          userId: callerId,
          description: updates.proposal.description,
          lastUpdated: new Date(),
        },
      ]);
    }
  } else {
    // Proposal field is null or undefined (for smooth backward compatibility)
    task.set("proposals", [
      {
        id: crypto.randomUUID(),
        userId: callerId,
        description: updates.proposal.description,
      },
    ]);
  }

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
