import React, { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import useAccess from './useAccess';
import useCardStatus from './useCardStatus';
import { useCardContext } from '../components/modules/cardModal';

export default function useCardDynamism() {
  const { user } = useMoralis();
  const { task, proposalEditMode } = useCardContext();

  const {
    isSpaceSteward,
    isCardSteward,
    isCardStakeholder,
    isSpaceMember,
    isCardAssignee,
  } = useAccess(task);
  const {
    isPaid,
    isClosed,
    isUnassigned,
    hasNoReward,
    hasAssignee,
    isTask,
    isBounty,
    isCreated,
    hasProposals,
  } = useCardStatus();
  const [tabs, setTabs] = useState([] as string[]);
  const [tabIdx, setTabIdx] = useState(0);
  const [payButtonView, setPayButtonView] = useState('hide');

  function getPayButtonView() {
    if (!isCardSteward() || isPaid() || isUnassigned() || hasNoReward())
      return 'hide';

    if (user?.get('distributorApproved')) {
      if (
        task.token?.address === '0x0' ||
        (task.chain?.chainId in user.get('distributorApproved') &&
          user
            .get('distributorApproved')
            [task.chain?.chainId].includes(task.token?.address))
      )
        return 'showPay';
      return 'showApprove';
    }
    if (task.token?.address === '0x0') return 'showPay';
    return 'showApprove';
  }
  const getReason = (field: string) => {
    if (isPaid()) {
      return 'Cannot edit, already paid for card';
    }
    switch (field) {
      case 'reward':
      case 'description':
      case 'title':
      case 'reviewer':
      case 'column':
      case 'type':
      case 'label':
        return `Only card reviewer or creator and space steward can edit ${field}`;
      case 'assignee':
        return `Only card assignee, reviewer or creator and space steward can edit ${field}`;
      case 'dueDate':
        return `Only card assignee, reviewer or creator and space steward can edit due date`;
      default:
        return '';
    }
  };

  const isStakeholderAndStatusUnpaid = () => {
    return isCardStakeholder() && !isPaid();
  };

  const isCardStewardAndUnpaidCardStatus = () => {
    return isCardSteward() && !isPaid();
  };

  const isAssigneeEditable = () => {
    if (isPaid()) return false;
    if (hasAssignee()) {
      return isCardStakeholder();
    }
    return true;
  };

  const isAssigneeViewable = () => {
    if (hasAssignee()) {
      return true;
    }
    return isCardSteward();
  };

  const isAssignToMeViewable = () => {
    if (!hasAssignee()) {
      return isTask() && isSpaceMember();
    }
    return false;
  };

  const resolveTabs = () => {
    if (isTask()) {
      return ['Comments', 'Activity'];
    }
    if (isBounty()) {
      // No assignee yet
      if (!hasAssignee()) {
        if (isCardSteward()) {
          return ['Applicants', 'Activity'];
        }
        if (task.proposals?.length > 0 || proposalEditMode) {
          return ['Application', 'Activity'];
        }
        return ['Activity']; // Only return application tab if there are any
      }
      // Card has been assigned
      if (isCardSteward()) {
        return ['Submissions', 'Activity', 'Applicants'];
      }
      if (isCardAssignee()) {
        return ['Submissions', 'Activity', 'Application'];
      }
      return ['Activity'];
    }
    return [];
  };

  const resolveTabIdx = (
    prevTabs: Array<string>,
    currTabs: Array<string>,
    prevTabIdx: number
  ) => {
    if (currTabs.length === prevTabs.length) {
      return prevTabIdx;
    }
    return 0;
  };

  const isApplyButtonViewable = () => {
    if (isBounty()) {
      if (isCardSteward()) {
        return false;
      }
      return !hasAssignee() && !hasProposals() && !isPaid() && !isClosed();
    }
    return false;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIdx(newValue);
  };

  useEffect(() => {
    setPayButtonView(getPayButtonView());
    const newTabs = resolveTabs();
    const newTabIdx = resolveTabIdx(tabs, newTabs, tabIdx);
    setTabs(newTabs);
    setTabIdx(newTabIdx);
  }, [task]);

  return {
    isAssignToMeViewable,
    getReason,
    tabs,
    setTabs,
    handleTabChange,
    tabIdx,
    isCardStewardAndUnpaidCardStatus,
    isStakeholderAndStatusUnpaid,
    isAssigneeEditable,
    isApplyButtonViewable,
    isAssigneeViewable,
    payButtonView,
  };
}
