import { useState, useEffect } from "react";
import { useSpace } from "../../pages/tribe/[id]/space/[bid]";
import { useMoralis } from "react-moralis";
import { Task } from "../types";

export function useCardDynamism(task: Task) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const [viewableComponents, setViewableComponents] = useState({} as any);
  const [editAbleComponents, setEditableComponents] = useState({} as any);
  const [cannotEditReason, setCannotEditReason] = useState({} as any);

  useEffect(() => {
    setViewableComponents(getViewableComponents());
    setEditableComponents(getEditableComponents());
    setCannotEditReason(getCannotEditReason());
  }, [task]);

  const getViewableComponents = () => {
    return {
      pay: getPayButtonView(),
      proposalGate: false,
      submissionGate: false,
      duplicate: isSpaceSteward(),
      archive: isSpaceSteward(),
    };
  };

  const getEditableComponents = () => {
    const editable = isGeneralEditable();
    return {
      title: editable,
      description: editable,
      label: editable,
      type: editable,
      dueDate: isDeadlineEditable(),
      reward: editable,
      reviewer: editable,
      column: isCardSteward(),
      assignee: isAssigneeEditable(),
    };
  };

  const getCannotEditReason = () => {
    return {
      title: getReason("title"),
      description: getReason("description"),
      label: getReason("label"),
      type: getReason("type"),
      dueDate: getReason("dueDate"),
      reward: getReason("reward"),
      reviewer: getReason("reviewer"),
      column: getReason("column"),
      assignee: getReason("assignee"),
    };
  };

  function getPayButtonView() {
    if (
      !task.value ||
      task.value === 0 ||
      !isCardSteward() ||
      task.status === 300 // Paid already
    ) {
      return "hide";
    }
    if (user?.get("distributorApproved")) {
      if (
        task.token?.address === "0x0" ||
        (task.chain?.chainId in user?.get("distributorApproved") &&
          user
            ?.get("distributorApproved")
            [task.chain?.chainId].includes(task.token?.address))
      )
        return "showPay";
      else return "showApprove";
    } else {
      if (task.token?.address === "0x0") return "showPay";
      else return "showApprove";
    }
  }

  const getReason = (field: string) => {
    if (task.status === 300) {
      return "Cannot edit, already paid for card";
    } else {
      switch (field) {
        case "reward" ||
          "description" ||
          "title" ||
          "reviewer" ||
          "column" ||
          "type":
          return `Only card reviewer or creator and space steward can edit ${field}`;
        case "assignee" || "dueDate":
          return `Only card assignee, reviewer or creator and space steward can edit ${field}`;
      }
    }
  };

  const isSpaceSteward = () => {
    return user?.id && space.roles[user?.id] === 3;
  };

  const isCardSteward = () => {
    return task?.access?.creator || task?.access?.reviewer || isSpaceSteward();
  };

  const isCardStakeholder = () => {
    return isCardSteward() || task?.access?.assignee;
  };

  const isDeadlineEditable = () => {
    return isCardStakeholder() && !(task.status === 300);
  };

  const isGeneralEditable = () => {
    return isCardSteward() && !(task.status === 300);
  };

  const isAssigneeEditable = () => {
    if (task.status === 300) return false;
    if (task?.assignee?.length > 0) {
      return isCardStakeholder();
    } else {
      return true;
    }
  };

  const getProposalView = () => {
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
    cannotEditReason,
  };
}
