import { Task } from '../types';
import { useCardContext } from '../components/modules/cardModal';

export default function useCardStatus() {
  const { task } = useCardContext();
  const codeToStatus: any = {
    100: 'created',
    105: 'assigned',
    200: 'inReview',
    201: 'inRevision',
    205: 'closed',
    300: 'paid',
    500: 'archived',
  };

  const statusToCode: any = {
    created: 100,
    assigned: 105,
    inReview: 200,
    inRevision: 201,
    closed: 205,
    paid: 300,
    archived: 500,
  };

  const isCreated = () => {
    return task.status === 100;
  };

  const isAssigned = () => {
    return task.status === 105;
  };

  const isUnassigned = () => {
    return !task.assignee || task.assignee?.length === 0;
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

  const hasNoComments = () => {
    return !task.comments || task.comments?.length === 0;
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
    hasNoComments,
    codeToStatus,
    statusToCode,
  };
}
