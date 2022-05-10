import PersonIcon from '@mui/icons-material/Person';
import {
  Autocomplete,
  Avatar,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { Task } from '../../../../types';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useProfileInfo from '../../../../hooks/useProfileInfo';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';
import MemberGroupDisplay from '../../../elements/memberGroupDisplay';
import MemberInfoDisplay from '../../../elements/memberInfoDisplay';
import CommonPopover from '../../../elements/popover';

type Props = {
  type: string;
};

function CardMemberPopover({ type }: Props) {
  const [members, setMembers] = useState([] as string[]);
  const { task, setTask, anchorEl } = useCardContext();
  const [isLoading, setIsLoading] = useState(false);
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
      setMembers(task.reviewer);
      setEditable(isCardStewardAndUnpaidCardStatus());
      setViewable(true);
    } else {
      setMembers(task.assignee);
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
