import DateRangeIcon from '@mui/icons-material/DateRange';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Avatar, Box, Popover, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { monthMap } from '../../../../constants';
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
  const { getReason, isStakeholderAndStatusUnpaid } = useCardDynamism();
  const { updateDate, clearDeadline } = useCardUpdate();
  const handleChange = (newValue: Date | null) => {
    console.log(newValue);
    if (isValid(newValue)) {
      if (newValue) setDate(newValue?.toISOString());
    }
  };
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
        {!isStakeholderAndStatusUnpaid() && (
          <PopoverContainer>
            <Typography variant="body2">{getReason('dueDate')}</Typography>
          </PopoverContainer>
        )}
        {isStakeholderAndStatusUnpaid() && (
          <PopoverContainer>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date"
                value={date}
                onChange={handleChange}
                PopperProps={{ placement: 'right-start' }}
                renderInput={(params) => (
                  <TextField {...params} required={false} />
                )}
                clearable
              />
            </LocalizationProvider>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              {date && (
                <PrimaryButton
                  variant="outlined"
                  sx={{ mt: 4, borderRadius: 1, width: '50%' }}
                  loading={loading}
                  color="secondary"
                  onClick={() => {
                    setDate(null);
                    clearDeadline(setOpen);
                  }}
                >
                  Clear
                </PrimaryButton>
              )}
              <PrimaryButton
                variant="outlined"
                sx={{
                  mt: 4,
                  ml: 2,
                  borderRadius: 1,
                  width: date ? '50%' : '100%',
                }}
                loading={loading}
                color="secondary"
                onClick={() => {
                  updateDate(setOpen);
                }}
              >
                Save
              </PrimaryButton>
            </Box>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}
export default DatePopover;
