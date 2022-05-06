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

type Props = {
  type: string;
};

function CardMemberPopover({ type }: Props) {
  const [member, setMember] = useState('');
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
  const { updateMember, openPopover, closePopover } = useCardUpdate();
  const { getAvatar } = useProfileInfo();

  useEffect(() => {
    if (type === 'reviewer') {
      setMember(task.reviewer[0]);
      setEditable(isCardStewardAndUnpaidCardStatus());
      setViewable(true);
    } else {
      setMember(task.assignee[0]);
      setEditable(isAssigneeEditable());
      setViewable(isAssigneeViewable());
    }
  }, [task]);

  return (
    <>
      {viewable && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: 2,
            mx: 1,
          }}
        >
          <Typography
            sx={{ fontSize: 12, color: 'text.secondary', width: '100%' }}
          >
            {type === 'reviewer' ? 'Reviewer' : 'Assignee'}
          </Typography>
          <CardButton
            variant="outlined"
            onClick={openPopover(setOpen)}
            color="secondary"
            sx={{
              padding: '6px',
              minWidth: '3rem',
            }}
          >
            <Avatar
              sx={{
                p: 0,
                mr: 2,
                width: 20,
                height: 20,
                backgroundColor: 'transparent',
              }}
              src={
                type === 'reviewer'
                  ? getAvatar(space.memberDetails[task.reviewer[0]])
                  : getAvatar(space.memberDetails[task.assignee[0]])
              }
            >
              <PersonIcon sx={{ color: 'text.primary' }} />
            </Avatar>
            <Typography
              sx={{
                fontSize: 14,
                minWidth: '3rem',
              }}
            >
              {type === 'reviewer'
                ? space.memberDetails[task.reviewer[0]]?.username ||
                  'No reviewer'
                : space.memberDetails[task.assignee[0]]?.username ||
                  'Unassigned'}
            </Typography>
          </CardButton>
        </Box>
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover(setOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {!editable && (
          <PopoverContainer>
            <Typography variant="body2">{getReason(type)}</Typography>
          </PopoverContainer>
        )}
        {editable && (
          <PopoverContainer>
            <Autocomplete
              options={space.members} // Get options from members
              value={member as any}
              getOptionLabel={(option) => space.memberDetails[option]?.username}
              onChange={(event, newValue) => {
                setMember(newValue as string);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="filled-hidden-label-normal"
                  size="small"
                  fullWidth
                  placeholder="Search member"
                />
              )}
            />
            <PrimaryButton
              variant="outlined"
              color="secondary"
              sx={{ mt: 4, borderRadius: 1 }}
              loading={isLoading}
              onClick={() => updateMember(type, member, setOpen)}
            >
              Save
            </PrimaryButton>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}

export default CardMemberPopover;
