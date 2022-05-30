import { useMoralis } from 'react-moralis';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Task } from '../types';

export default function useAccess() {
  const { space } = useSpace();
  const { user } = useMoralis();

  const isCardReviewer = (task: Task) => {
    return task.access?.reviewer;
  };

  const isCardCreator = (task: Task) => {
    return task?.access?.creator;
  };

  const isCardAssignee = (task: Task) => {
    return task?.access?.assignee;
  };

  const isSpaceSteward = () => {
    return user?.id && space.roles[user?.id] === 3;
  };
  const isSpaceContributor = () => {
    return (user?.id && space.roles[user?.id] === 2) || isSpaceSteward();
  };
  const isSpaceMember = () => {
    return (user?.id && space.roles[user?.id] === 1) || isSpaceContributor();
  };
  const isCardSteward = (task: Task) => {
    return isCardReviewer(task) || isSpaceSteward();
  };

  const isCardStakeholder = (task: Task) => {
    return isCardSteward(task) || isCardAssignee(task) || isCardCreator(task);
  };

  return {
    isCardReviewer,
    isCardCreator,
    isSpaceSteward,
    isSpaceContributor,
    isSpaceMember,
    isCardSteward,
    isCardAssignee,
    isCardStakeholder,
  };
}
