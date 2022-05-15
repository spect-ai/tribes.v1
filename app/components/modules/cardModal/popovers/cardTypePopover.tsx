import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../../hooks/useMoralisFunction';
import { Task } from '../../../../types';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCard from '../../../../hooks/useCard';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function CardTypePopover({ task, setTask }: Props) {
  const [open, setOpen] = useState(false);
  const { getReason } = useCardDynamism(task);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const {
    anchorEl,
    openPopover,
    closePopover,
    type,
    setType,
    isLoading,
    updateType,
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
        <CardButton
          variant="outlined"
          onClick={openPopover('type', setOpen, setFeedbackOpen)}
          color="secondary"
          size="small"
          sx={{
            padding: '2px',
            minWidth: '3rem',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
            }}
          >
            {task.type || 'Task'}
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
          <Typography variant="body2">{getReason('type')}</Typography>
        </PopoverContainer>
      </Popover>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover(setOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Autocomplete
            options={['Task', 'Bounty']} // Get options from members
            value={type as any}
            onChange={(event, newValue) => {
              setType(newValue as string);
            }}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search types"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            color="secondary"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            onClick={() => updateType(setOpen)}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default CardTypePopover;
