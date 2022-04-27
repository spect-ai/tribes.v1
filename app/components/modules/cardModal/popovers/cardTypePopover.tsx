import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Task } from '../../../../types';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';

function CardTypePopover() {
  const [open, setOpen] = useState(false);
  const {
    task,
    setTask,
    type,
    setType,
    loading,
    anchorEl,
    openPopover,
    closePopover,
  } = useCardContext();

  const { getReason, editAbleComponents } = useCardDynamism();
  const { updateType } = useCardUpdate();
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
          onClick={openPopover(setOpen)}
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
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover(setOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {!editAbleComponents.type && (
          <PopoverContainer>
            <Typography variant="body2">{getReason('type')}</Typography>
          </PopoverContainer>
        )}
        {editAbleComponents.type && (
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
              loading={loading}
              onClick={() => updateType(setOpen)}
            >
              Save
            </PrimaryButton>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}

export default CardTypePopover;
