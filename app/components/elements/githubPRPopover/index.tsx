import { ContentCopy, GitHub } from '@mui/icons-material';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useCardContext } from '../../modules/cardModal';
import { notify } from '../../modules/settingsTab';
import { PrimaryButton } from '../styledComponents';
import PopoverContainer from './styles';

type Props = {};

function GithubPRPopover(props: Props) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<any>();
  const { task } = useCardContext();
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <PrimaryButton
        startIcon={<GitHub />}
        variant="outlined"
        color="secondary"
        size="small"
        sx={{ mt: 3 }}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          setOpen(true);
        }}
      >
        Link Github PR
      </PrimaryButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Typography fontSize={14}>
            You can link your github PR to this task by adding taskID(s) to your
            PR title using this format(add mutliple Ids in the brackets):
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Typography
              fontSize={14}
              sx={{ background: '#000f29', fontStyle: 'italic', p: 1, my: 2 }}
            >
              {`Spect [${task.taskId}] PR Title`}
            </Typography>
            <IconButton
              color="secondary"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(
                  `Spect [${task.taskId}] PR Title`
                );
                notify('Copied');
              }}
              sx={{ ml: 2 }}
            >
              <ContentCopy sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Typography fontSize={14} sx={{ p: 1 }}>
              {task.taskId}
            </Typography>
            <IconButton
              color="secondary"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(task.taskId);
                notify('Copied');
              }}
              sx={{ ml: 2 }}
            >
              <ContentCopy sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default GithubPRPopover;
