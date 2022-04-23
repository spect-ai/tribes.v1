import DateRangeIcon from '@mui/icons-material/DateRange';
import { Avatar, Box, Popover, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { monthMap } from '../../../../constants';
import { Task } from '../../../../types';
import { formatTime } from '../../../../utils/utils';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCard from '../../../../hooks/useCard';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function DatePopover({ task, setTask }: Props) {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { getReason } = useCardDynamism(task);
  const {
    updateDate,
    openPopover,
    closePopover,
    anchorEl,
    date,
    setDate,
    isLoading,
  } = useCard(setTask, task);

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
          onClick={openPopover('dueDate', setOpen, setFeedbackOpen)}
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
        open={feedbackOpen}
        anchorEl={anchorEl}
        onClose={() => closePopover(setFeedbackOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Typography variant="body2">{getReason('dueDate')}</Typography>
        </PopoverContainer>
      </Popover>
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
            loading={isLoading}
            color="secondary"
            onClick={() => {
              updateDate(setOpen);
            }}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
}
export default DatePopover;
