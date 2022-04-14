import { useState, useEffect } from "react";
import { useSpace } from "../../pages/tribe/[id]/space/[bid]";
import { useMoralis } from "react-moralis";
import { Task } from "../types";

export function useCardDynamism(task: Task) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const [viewableComponents, setViewableComponents] = useState({} as any);
  const [editAbleComponents, setEditableComponents] = useState({} as any);

  const cardInfoFields = [
    "title",
    "description",
    "tags",
    "type",
    "due Date",
    "reward",
    "reviewer",
    "column",
  ];

  useEffect(() => {
    setViewableComponents(getViewableComponents(task));
    setEditableComponents(getEditableComponents(task));
  }, [task]);

  const getViewableComponents = (task: Task) => {
    return {
      label: isLabelsViewable(task),
      dueDate: isDeadlineViewable(task),
      reward: isRewardViewable(task),
      assignee: isAssigneeViewable(task),
      pay: true,
      proposalGate: false,
      submissionGate: false,
      duplicate: isSpaceSteward(),
      archive: isSpaceSteward(),
    };
  };

  const getEditableComponents = (task: Task) => {
    const isStewardOfCard = isCardSteward(task);
    return {
      title: isStewardOfCard,
      description: isStewardOfCard,
      label: isStewardOfCard,
      type: isStewardOfCard,
      dueDate: isCardStakeholder(task),
      reward: isStewardOfCard,
      reviewer: isStewardOfCard,
      column: isStewardOfCard,
      assignee: isAssigneeEditable(task),
    };
  };

  const isLabelsViewable = (task: Task) => {
    return (task.tags && task.tags?.length > 0) || isCardSteward(task);
  };

  const isRewardViewable = (task: Task) => {
    return (task.value && task.value > 0) || isCardSteward(task);
  };

  const isAssigneeViewable = (task: Task) => {
    return (task.assignee && task.assignee.length > 0) || isCardSteward(task);
  };

  const isDeadlineViewable = (task: Task) => {
    return task.deadline || isCardSteward(task);
  };

  const isSpaceSteward = () => {
    return user?.id && space.roles[user?.id] === 3;
  };

  const isCardSteward = (task: Task) => {
    return task?.access?.creator || task?.access?.reviewer || isSpaceSteward();
  };

  const isCardStakeholder = (task: Task) => {
    return isCardSteward(task) || task?.access?.assignee;
  };

  const isAssigneeEditable = (task: Task) => {
    if (task?.assignee?.length > 0) {
      return isCardStakeholder(task);
    } else {
      return true;
    }
  };

  const getProposalView = (task: Task) => {
    if (
      task?.access?.creator ||
      task?.access?.reviewer ||
      (user?.id && space.roles[user?.id] === 3)
    ) {
      if ([400].includes(task?.status)) {
        return "adminView";
      } else {
        return "pick";
      }
    } else if (task?.access?.applicant) {
      if ([400].includes(task?.status)) {
        return "applicantView";
      } else {
        return "apply";
      }
    } else {
      if ([400].includes(task?.status)) {
        return "generalView";
      } else {
        return "generalApply";
      }
    }
  };

  const getSubmissionView = (task: Task) => {};

  return {
    viewableComponents,
    editAbleComponents,
  };
}
