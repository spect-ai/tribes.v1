import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';
import useCardDynamism from '../../../../hooks/useCardDynamism';

function ColumnPopover() {
  const { space, setSpace } = useSpace();
  const [open, setOpen] = useState(false);
  const { updateColumn } = useCardUpdate();
  const {
    task,
    setTask,
    loading,
    col,
    setCol,
    openPopover,
    closePopover,
    anchorEl,
  } = useCardContext();
  const { editAbleComponents } = useCardDynamism();

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
            {task.columnId && space.columnOrder.includes(task.columnId)
              ? space.columns[task.columnId as string]?.title
              : space.columns[col as string]?.title}
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
        {!editAbleComponents.column && (
          <PopoverContainer>
            <Typography variant="body2">
              Only card reviewer, assignee or creator and space steward can
              change column
            </Typography>
          </PopoverContainer>
        )}
        {editAbleComponents.column && (
          <PopoverContainer>
            <Autocomplete
              options={space.columnOrder}
              value={col}
              getOptionLabel={(option) => space.columns[option].title}
              onChange={(event, newValue) => {
                setCol(newValue as any);
              }}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="filled-hidden-label-normal"
                  size="small"
                  fullWidth
                  placeholder="Search types"
                  color="secondary"
                />
              )}
            />
            <PrimaryButton
              variant="outlined"
              color="secondary"
              sx={{ mt: 4, borderRadius: 1 }}
              loading={loading}
              onClick={() => {
                updateColumn(setOpen);
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

export default ColumnPopover;
