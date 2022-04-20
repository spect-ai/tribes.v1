import DateRangeIcon from '@mui/icons-material/DateRange';
import { Avatar, Box, Popover, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { monthMap } from '../../../../constants';
import useMoralisFunction from '../../../../hooks/useMoralisFunction';
import { Task } from '../../../../types';
import { formatTime } from '../../../../utils/utils';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function DatePopover({ task, setTask }: Props) {
  const [date, setDate] = useState('');
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { space, setSpace } = useSpace();
  const { Moralis } = useMoralis();
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { runMoralisFunction } = useMoralisFunction();
  const { editAbleComponents, getReason } = useCardDynamism(task);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents.dueDate) {
      setOpen(true);
    } else {
      setFeedbackOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  const handleSave = () => {
    const prevTask = { ...task };
    const temp = { ...task };
    temp.deadline = new Date(date);
    setTask(temp);
    handleClose();
    runMoralisFunction('updateCard', {
      updates: {
        deadline: new Date(date).toUTCString(),
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, 'error');
      });
  };

  useEffect(() => {
    if (task.deadline) {
      const offset = task.deadline.getTimezoneOffset();
      const deadline = new Date(task.deadline.getTime() - offset * 60 * 1000);
      setDate(deadline.toISOString().slice(0, -8));
    }
  }, [task]);

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
          onClick={handleClick()}
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
        onClose={() => handleFeedbackClose()}
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
          handleClose();
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
            onClick={handleSave}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
}
export default DatePopover;
