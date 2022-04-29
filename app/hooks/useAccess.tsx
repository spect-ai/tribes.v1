import { useMoralis } from 'react-moralis';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Task } from '../types';

export default function useAccess(task: Task) {
  const { space } = useSpace();
  const { user } = useMoralis();

  const isCardReviewer = () => {
    return task.access?.reviewer;
  };

  const isCardCreator = () => {
    return task?.access?.creator;
  };

  const isCardAssignee = () => {
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
  const isCardSteward = () => {
    return isCardReviewer() || isSpaceSteward();
  };

  const isCardStakeholder = () => {
    return isCardSteward() || isCardAssignee() || isCardCreator();
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
