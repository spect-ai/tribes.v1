import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from './useMoralisFunction';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Task, Block } from '../types';
import { notify } from '../components/modules/settingsTab';
import useCardStatus from './useCardStatus';
import { useCardContext } from '../components/modules/cardModal';
import {
  isEqualArrayIgnoringLocations,
  dateDiffInMinutes,
} from '../utils/utils';

export default function useCardUpdate() {
  const { user } = useMoralis();
  const { setSpace } = useSpace();
  const {
    task,
    setTask,
    chain,
    token,
    value,
    title,
    proposalOnEdit,
    col,
    type,
    date,
    labels,
    proposalEditMode,
    setProposalEditMode,
    openPopover,
    closePopover,
  } = useCardContext();
  const { codeToStatus, statusToCode } = useCardStatus();
  const { runMoralisFunction } = useMoralisFunction();

  const successMessage: any = {
    inReview: 'Asked for a review',
    inRevision: 'Asked for revision',
    closed: 'Closed card',
    proposalEdit: 'Application submitted',
    proposalPick: 'Selected applicant!',
  };

  const giveSuccessNotification = (updateType: string) => {
    if (successMessage[updateType]) {
      notify(successMessage[updateType], 'success');
    }
  };

  const handleGreedHelper = (
    temp: Task,
    key: string,
    val: any,
    prevTask: Task
  ) => {
    const newTask = temp;
    if (key === 'title') newTask.title = val;
    else if (key === 'chain') newTask.chain = val;
    else if (key === 'token') newTask.token = val;
    else if (key === 'value') newTask.value = parseFloat(val);
    else if (key === 'tags') newTask.tags = val;
    else if (key === 'reviewer') newTask.reviewer = [val];
    else if (key === 'assignee') newTask.assignee = [val];
    else if (key === 'type') newTask.type = val;
    else if (key === 'deadline') newTask.deadline = val ? new Date(val) : null;
    else if (key === 'proposals')
      newTask.proposals = [
        {
          id: '',
          content: val.content as string,
          userId: user?.id as string,
          createdAt:
            prevTask.proposals?.length > 0
              ? prevTask.proposals[0].createdAt
              : new Date(),
          updatedAt: new Date(),
          edited: false,
        },
      ];
    else if (key === 'column') newTask.columnId = val;
    return newTask;
  };

  const handleGreed = (updates: any, prevTask: Task) => {
    let temp = { ...task } as Task;
    Object.keys(updates).forEach((key) => {
      temp = handleGreedHelper(temp, key, updates[key], prevTask);
    });
    setTask(temp);
  };

  const executeCardUpdates = (
    params: any,
    updateType: string,
    greedy: boolean = false
  ) => {
    const prevTask = { ...task } as Task;

    if (greedy) {
      handleGreed(params.updates, prevTask);
    }
    runMoralisFunction('updateCard', params)
      .then((res: any) => {
        setSpace(res.space);
        task && setTask(res.task);
        giveSuccessNotification(updateType);
      })
      .catch((err: any) => {
        if (greedy) setTask(prevTask);
        notify(err.message, 'error');
      });
  };

  const updateVotes = (userId: string, taskId: string) => {
    executeCardUpdates(
      {
        updates: {
          votes: userId,
          taskId,
        },
      },
      'updateVotes',
      false
    );
  };

  const updateTitle = () => {
    executeCardUpdates(
      {
        updates: {
          title,
          taskId: task.taskId,
        },
      },
      'updateTitle',
      true
    );
  };

  const updateDescription = (description: Block[]) => {
    executeCardUpdates(
      {
        updates: {
          description,
          taskId: task.taskId,
        },
      },
      'updateDescription',
      false
    );
  };

  const updateSubmission = (submission: Block[], id: string | null) => {
    executeCardUpdates(
      {
        updates: {
          submissions: {
            id,
            content: submission,
          },
          taskId: task.taskId,
        },
      },
      'submissionEdit',
      false
    );
  };

  const updateRevisionInstruction = (
    id: string,
    revisionInstruction: string
  ) => {
    executeCardUpdates(
      {
        updates: {
          status: statusToCode.inRevision,
          submissions: {
            id,
            revisionInstruction,
          },
          taskId: task.taskId,
        },
      },
      codeToStatus[statusToCode.inRevision],
      false
    );
  };

  const updateToDone = (feedback: string) => {
    executeCardUpdates(
      {
        updates: {
          status: statusToCode.closed,
          feedback,
          taskId: task.taskId,
        },
      },
      codeToStatus[statusToCode.closed],
      false
    );
  };

  const updateStatus = (status: number) => {
    executeCardUpdates(
      {
        updates: {
          status,
          taskId: task.taskId,
        },
      },
      codeToStatus[status],
      false
    );
  };

  const updateProposal = () => {
    setProposalEditMode(false);
    executeCardUpdates(
      {
        updates: {
          proposals: {
            content: proposalOnEdit,
          },
          taskId: task.taskId,
        },
      },
      'proposalEdit',
      true
    );
  };

  const updateStatusAndAssignee = (assignee: string, updateType: string) => {
    executeCardUpdates(
      {
        updates: {
          status: statusToCode.assigned,
          assignee: [assignee],
          taskId: task.taskId,
        },
      },
      updateType,
      true
    );
  };

  const updateStatusAndTransactionHash = (
    cardIds: string[],
    transactionHash: string
  ) => {
    executeCardUpdates(
      {
        updates: {
          status: statusToCode.paid,
          transactionHash,
          taskId: cardIds[0],
        },
      },
      'pay',
      false
    );
  };

  const updateMember = (
    memberType: string,
    members: string[],
    setOpen: Function
  ) => {
    let updates = {};
    if (memberType === 'reviewer') {
      if (isEqualArrayIgnoringLocations(members, task.reviewer)) return;

      updates = {
        reviewer: members || [],
        taskId: task.taskId,
      };
    } else {
      if (isEqualArrayIgnoringLocations(members, task.assignee)) return;
      updates = {
        assignee: members || [],
        taskId: task.taskId,
        status: members ? statusToCode.assigned : statusToCode.created,
      };
    }
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates,
      },
      memberType,
      true
    );
  };

  const updateType = (newType: string) => {
    if (newType === task.type) return;

    executeCardUpdates(
      {
        updates: {
          type: newType,
          taskId: task.taskId,
        },
      },
      'type',
      true
    );
  };

  const updateDate = () => {
    const dateDIff = dateDiffInMinutes(
      new Date(date),
      new Date(task.deadline as Date)
    );
    if (!dateDIff) return;
    executeCardUpdates(
      {
        updates: {
          deadline: date ? new Date(date).toUTCString() : null,
          taskId: task.taskId,
        },
      },
      'deadline',
      true
    );
  };

  const clearDeadline = (setOpen: Function) => {
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates: {
          deadline: null,
          taskId: task.taskId,
        },
      },
      'deadline',
      true
    );
  };

  const updateLabels = () => {
    if (isEqualArrayIgnoringLocations(labels, task.tags)) return;
    executeCardUpdates(
      {
        updates: {
          tags: labels,
          taskId: task.taskId,
        },
      },
      'labels',
      true
    );
  };

  const updateReward = () => {
    if (
      chain.chainId === task.chain?.chainId &&
      token.address === task.token?.address &&
      parseFloat(value) === task.value
    ) {
      return;
    }
    executeCardUpdates(
      {
        updates: {
          chain,
          token,
          value: parseFloat(value),
          taskId: task.taskId,
        },
      },
      'reward',
      true
    );
  };

  const updateColumn = (newCol: string) => {
    if (newCol === task.columnId) return;
    executeCardUpdates(
      {
        updates: {
          columnChange: {
            sourceId: task.columnId,
            destinationId: newCol,
          },
          taskId: task.taskId,
        },
      },
      'column',
      true
    );
  };

  const updateStatusAndTransactionHashInMultipleCards = (
    cardIds: string[],
    transactionHash: string
  ) => {
    const updates: any = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const cardId of cardIds) {
      updates[cardId] = { status: 300, transactionHash };
    }

    runMoralisFunction('updateMultipleCards', {
      updates,
    })
      .then((res: any) => {
        setSpace(res.space);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
          'error'
        );
      });
  };

  return {
    openPopover,
    closePopover,
    executeCardUpdates,
    setProposalEditMode,
    proposalEditMode,
    updateTitle,
    updateDescription,
    updateSubmission,
    updateStatus,
    updateType,
    updateDate,
    clearDeadline,
    updateStatusAndAssignee,
    updateStatusAndTransactionHash,
    updateMember,
    updateProposal,
    updateLabels,
    updateReward,
    updateColumn,
    updateStatusAndTransactionHashInMultipleCards,
    updateVotes,
    updateRevisionInstruction,
    updateToDone,
  };
}
