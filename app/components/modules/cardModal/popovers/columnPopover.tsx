import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { Column, Task } from '../../../../types';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import useCard from '../../../../hooks/useCard';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
  column: Column;
};

function ColumnPopover({ task, setTask, column }: Props) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { space, setSpace } = useSpace();
  const [open, setOpen] = useState(false);
  const {
    updateColumn,
    anchorEl,
    openPopover,
    closePopover,
    isLoading,
    col,
    setCol,
    currCol,
    setCurrCol,
  } = useCard(setTask, task, column);

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
          data-testid="bColumnButton"
          variant="outlined"
          onClick={openPopover('column', setOpen, setFeedbackOpen)}
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
            {space.columns[currCol as string]?.title}
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
          <Typography variant="body2">
            Only card reviewer or creator and space steward can change column
          </Typography>
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
            data-testid="aColumnPicker"
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
            data-testid="bColumnSave"
            variant="outlined"
            color="secondary"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            onClick={() => {
              updateColumn(setOpen);
            }}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default ColumnPopover;
