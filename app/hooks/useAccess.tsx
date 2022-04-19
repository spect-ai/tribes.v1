import { useState, useEffect } from 'react';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { useMoralis } from 'react-moralis';
import { Task } from '../types';

export function useAccess(task: Task) {
  const { space } = useSpace();
  const { user } = useMoralis();

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
    return task?.access?.creator || task?.access?.reviewer || isSpaceSteward();
  };

  const isCardAssignee = () => {
    return task?.access?.assignee;
  };

  const isCardStakeholder = () => {
    return isCardSteward() || isCardAssignee();
  };

  return {
    isSpaceSteward,
    isSpaceContributor,
    isSpaceMember,
    isCardSteward,
    isCardAssignee,
    isCardStakeholder,
  };
}
