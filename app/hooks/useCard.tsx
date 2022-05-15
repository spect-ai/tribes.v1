import React, { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from './useMoralisFunction';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Task, Block, Column } from '../types';
import { notify } from '../components/modules/settingsTab';
import useCardStatus from './useCardStatus';
import useCardDynamism from './useCardDynamism';

export default function useCard(
  setTask: Function,
  task: Task,
  column?: Column
) {
  const { user } = useMoralis();
  const { setSpace } = useSpace();
  const { codeToStatus, statusToCode } = useCardStatus(task);
  const { editAbleComponents } = useCardDynamism(task);
  const { runMoralisFunction } = useMoralisFunction();
  const { proposalEditMode, setProposalEditMode } = useCardDynamism(task);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [type, setType] = useState(task?.type || 'Task');
  const [date, setDate] = useState('');
  const [proposalOnEdit, setProposalOnEdit] = useState('');
  const [labels, setLabels] = useState(task.tags);
  const [chain, setChain] = useState(task.chain);
  const [token, setToken] = useState(task.token);
  const [value, setValue] = useState(task.value?.toString());
  const [currCol, setCurrCol] = useState('');
  const [col, setCol] = useState<string>('');

  useEffect(() => {
    setTitle(task.title);
    if (task.proposals?.length > 0) {
      setProposalOnEdit(task.proposals[0].content);
      if (task.proposals[0]?.content === '') setProposalEditMode(true);
      else setProposalEditMode(false);
    }
    if (task.deadline) {
      const offset = task.deadline.getTimezoneOffset();
      const deadline = new Date(task.deadline.getTime() - offset * 60 * 1000);
      setDate(deadline.toISOString().slice(0, -8));
    }
    if (task?.type) setType(task.type);
    else setType('Task');

    if (column) {
      setCurrCol(column.id);
      setCol(column.id);
    }

    setChain(task.chain);
    setToken(task.token);
    setValue(task.value?.toString());
  }, []);

  const openPopover =
    (popoverType: string, setOpen: Function, setFeedbackOpen: Function) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      if (editAbleComponents[popoverType]) {
        setOpen(true);
      } else {
        setFeedbackOpen(true);
      }
    };
  const closePopover = (setOpen: Function) => {
    setOpen(false);
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
    else if (key === 'deadline') newTask.deadline = new Date(val);
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
    setIsLoading(true);
    runMoralisFunction('updateCard', params)
      .then((res: any) => {
        setSpace(res.space);
        setTask(res.task);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (greedy) setTask(prevTask);
        notify(err.message, 'error');
        setIsLoading(false);
      });
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

  const updateSubmission = (submission: Block[]) => {
    executeCardUpdates(
      {
        updates: {
          submissions: {
            content: submission,
          },
          taskId: task.taskId,
        },
      },
      'submissionEdit',
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

  const updateStatusAndAssignee = (
    proposalId: string,
    index: number,
    assignee: string
  ) => {
    executeCardUpdates(
      {
        updates: {
          status: statusToCode.assigned,
          assignee: [assignee],
          taskId: task.taskId,
        },
      },
      'proposalPick',
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
    member: string,
    setOpen: Function
  ) => {
    let updates = {};
    if (memberType === 'reviewer') {
      updates = {
        reviewer: member ? [member] : [],
        taskId: task.taskId,
      };
    } else {
      updates = {
        assignee: member ? [member] : [],
        taskId: task.taskId,
        status: member ? statusToCode.assigned : statusToCode.created,
      };
    }
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates,
      },
      'reviewer',
      true
    );
  };

  const updateType = (setOpen: Function) => {
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates: {
          type,
          taskId: task.taskId,
        },
      },
      'type',
      true
    );
  };

  const updateDate = (setOpen: Function) => {
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates: {
          deadline: new Date(date).toUTCString(),
          taskId: task.taskId,
        },
      },
      'deadline',
      true
    );
  };

  const updateLabels = (setOpen: Function) => {
    closePopover(setOpen);
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

  const updateReward = (setOpen: Function) => {
    closePopover(setOpen);
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

  // TODO: Fix revert on greedy update
  const updateColumn = (setOpen: Function) => {
    setCurrCol(col);
    closePopover(setOpen);
    executeCardUpdates(
      {
        updates: {
          columnChange: {
            sourceId: column?.id,
            destinationId: col,
          },
          taskId: task.taskId,
        },
      },
      'column',
      false
    );
  };

  return {
    isLoading,
    openPopover,
    closePopover,
    anchorEl,
    executeCardUpdates,
    labels,
    setLabels,
    type,
    setType,
    title,
    setTitle,
    date,
    setDate,
    chain,
    setChain,
    token,
    setToken,
    value,
    setValue,
    setProposalEditMode,
    proposalEditMode,
    setProposalOnEdit,
    proposalOnEdit,
    currCol,
    setCurrCol,
    col,
    setCol,
    updateTitle,
    updateDescription,
    updateSubmission,
    updateStatus,
    updateType,
    updateDate,
    updateStatusAndAssignee,
    updateStatusAndTransactionHash,
    updateMember,
    updateProposal,
    updateLabels,
    updateReward,
    updateColumn,
  };
}
