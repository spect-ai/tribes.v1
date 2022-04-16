import { useState, useEffect } from "react";
import { useSpace } from "../../pages/tribe/[id]/space/[bid]";
import { useMoralis } from "react-moralis";
import { Task } from "../types";
import { useAccess } from "./useAccess";

export function useCardDynamism(task: Task) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const { isSpaceSteward, isCardSteward, isCardStakeholder, isSpaceMember } =
    useAccess(task);
  const [viewableComponents, setViewableComponents] = useState({} as any);
  const [editAbleComponents, setEditableComponents] = useState({} as any);
  const [proposalEditMode, setProposalEditMode] = useState(false);
  const [tabs, setTabs] = useState([] as string[]);
  const [tabIdx, setTabIdx] = useState(0);
  useEffect(() => {
    setViewableComponents(getViewableComponents());
    setEditableComponents(getEditableComponents());
    setTabs(getTabs());
    setTabIdx(0);
  }, [task]);

  const getViewableComponents = () => {
    return {
      pay: getPayButtonView(),
      proposalGate: false,
      submissionGate: false,
      duplicate: isSpaceSteward(),
      archive: isSpaceSteward(),
      assignee: isAssigneeViewable(),
      reviewer: true,
      assignToMe: isAssignToMeViewable(),
      addComment: isSpaceSteward() || isCardStakeholder(),
      optionPopover: isSpaceSteward() || isCardStakeholder(),
      applyButton: isApplyButtonViewable(),
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
        case "reward":
        case "description":
        case "title":
        case "reviewer":
        case "column":
        case "type":
        case "label":
          return `Only card reviewer or creator and space steward can edit ${field}`;
        case "assignee":
        case "dueDate":
          return `Only card assignee, reviewer or creator and space steward can edit ${field}`;
      }
    }
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

  const isAssigneeViewable = () => {
    if (task?.assignee?.length > 0) {
      return true;
    } else {
      return isCardSteward();
    }
  };

  const isAssignToMeViewable = () => {
    if (task?.assignee?.length === 0) {
      return task.type === "Task" && isSpaceMember();
    } else return false;
  };

  const getTabs = () => {
    if (task.type === "Task") {
      return ["Comments", "Activity"];
    } else if (task.type === "Bounty") {
      // No assignee yet
      if (task.status === 100) {
        if (isCardSteward()) {
          return ["Applicants", "Activity"];
        } else if (task.proposals?.length > 0 || proposalEditMode) {
          return ["Application", "Activity"];
        } else {
          return ["Activity"]; // Only return application tab if there are any
        }
      } else {
        if (isCardSteward()) {
          return ["Submissions", "Activity", "Applicants"];
        } else {
          return ["Submissions", "Activity", "Application"];
        }
      }
    } else return [];
  };

  const isApplyButtonViewable = () => {
    if (task.type === "Bounty") {
      if (task.access?.reviewer || task.access?.creator) {
        return false;
      }
      return task.status === 100 && task.proposals?.length === 0;
    } else {
      return false;
    }
  };

  const getSubmissionView = () => {
    if (task?.status === 100) {
      return "hide";
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIdx(newValue);
  };

  return {
    viewableComponents,
    editAbleComponents,
    getReason,
    getTabs,
    proposalEditMode,
    setProposalEditMode,
    tabs,
    setTabs,
    handleTabChange,
    tabIdx,
  };
}
