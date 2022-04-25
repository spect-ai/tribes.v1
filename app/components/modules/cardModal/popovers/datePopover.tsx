import DateRangeIcon from '@mui/icons-material/DateRange';
import { Avatar, Box, Popover, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { monthMap } from '../../../../constants';
import { Task } from '../../../../types';
import { formatTime } from '../../../../utils/utils';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';

function DatePopover() {
  const [open, setOpen] = useState(false);
  const {
    task,
    setTask,
    date,
    setDate,
    loading,
    openPopover,
    closePopover,
    anchorEl,
  } = useCardContext();
  const { getReason, editAbleComponents } = useCardDynamism();
  const { updateDate } = useCardUpdate();

  return (
    <>
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
          Due Date
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
            variant="rounded"
            sx={{
              p: 0.1,
              mr: 2,
              width: 20,
              height: 20,
              backgroundColor: 'transparent',
            }}
          >
            <DateRangeIcon sx={{ color: 'text.primary' }} />
          </Avatar>
          <Typography
            sx={{
              fontSize: 14,
            }}
          >
            {task.deadline ? (
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                {task.deadline?.getDate()}{' '}
                {monthMap[task.deadline?.getMonth() as keyof typeof monthMap]}{' '}
                {task.deadline && formatTime(task.deadline)}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                No deadline
              </Typography>
            )}
          </Typography>
        </CardButton>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          closePopover(setOpen);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {!editAbleComponents.dueDate && (
          <PopoverContainer>
            <Typography variant="body2">{getReason('dueDate')}</Typography>
          </PopoverContainer>
        )}
        {editAbleComponents.dueDate && (
          <PopoverContainer>
            <TextField
              id="datetime-local"
              label="Due Date"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              fullWidth
            />
            <PrimaryButton
              variant="outlined"
              sx={{ mt: 4, borderRadius: 1 }}
              loading={loading}
              color="secondary"
              onClick={() => {
                updateDate(setOpen);
              }}
            >
              Save
            </PrimaryButton>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}
export default DatePopover;
