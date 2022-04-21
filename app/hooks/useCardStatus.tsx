import { Task } from '../types';

export default function useCardStatus(task: Task) {
  const isCreated = () => {
    return task.status === 100;
  };

  const isAssigned = () => {
    return task.status === 105;
  };

  const isUnassigned = () => {
    return task.assignee.length === 0;
  };

  const isInReview = () => {
    return task.status === 200;
  };

  const isInRevision = () => {
    return task.status === 201;
  };

  const isClosed = () => {
    return task.status === 205;
  };

  const isPaid = () => {
    return task.status === 300;
  };

  const isArchived = () => {
    return task.status === 500;
  };

  const hasNoReward = () => {
    return !task.value || task.value === 0;
  };

  return {
    isCreated,
    isInReview,
    isInRevision,
    isAssigned,
    isClosed,
    isArchived,
    isPaid,
    isUnassigned,
    hasNoReward,
  };
}
