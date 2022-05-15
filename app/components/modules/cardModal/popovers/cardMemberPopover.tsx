import React, { useEffect, useState } from 'react';
import { useCardContext } from '..';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import MemberGroupDisplay from '../../../elements/memberGroupDisplay';
import MemberInfoDisplay from '../../../elements/memberInfoDisplay';
import CommonPopover from '../../../elements/popover';

type Props = {
  type: string;
};

function CardMemberPopover({ type }: Props) {
  const { task } = useCardContext();
  const [members, setMembers] = useState(
    type === 'reviewer' ? task.reviewer || [] : task.assignee || []
  );
  const [editable, setEditable] = useState(false);
  const [viewable, setViewable] = useState(false);
  const { space, setSpace } = useSpace();
  const [open, setOpen] = useState(false);
  const {
    isCardStewardAndUnpaidCardStatus,
    isAssigneeEditable,
    getReason,
    isAssigneeViewable,
  } = useCardDynamism();
  const { updateMember } = useCardUpdate();

  useEffect(() => {
    if (type === 'reviewer') {
      setEditable(isCardStewardAndUnpaidCardStatus());
      setViewable(true);
    } else {
      setEditable(isAssigneeEditable());
      setViewable(isAssigneeViewable());
    }
  }, [task]);

  return (
    <CommonPopover
      label={type === 'reviewer' ? 'Reviewer' : 'Assignee'}
      buttonText={
        <MemberGroupDisplay
          members={members}
          memberDetails={space.memberDetails}
          placeholder={`No ${type}`}
        />
      }
      buttonsx={{
        padding: '6px',
        minWidth: '3rem',
        minHeight: '2.6rem',
      }}
      popoverContent={
        editable
          ? [
              {
                fieldType: 'autocomplete',
                options: space.members,
                currOption: members,
                setCurrOption: setMembers,
                // eslint-disable-next-line react/no-unstable-nested-components
                optionLabels: (option: string) => (
                  <MemberInfoDisplay member={space.memberDetails[option]} />
                ),
                multiple: true,
                closeOnSelect: false,
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason(type),
              },
            ]
      }
      beforeClose={() => updateMember(type, members, setOpen)}
    />
  );
}

export default CardMemberPopover;
