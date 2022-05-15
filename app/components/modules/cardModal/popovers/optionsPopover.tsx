import ArchiveIcon from '@mui/icons-material/Archive';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VideoStableIcon from '@mui/icons-material/VideoStable';
import ViewCompactAltIcon from '@mui/icons-material/ViewCompactAlt';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import React, { useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../../hooks/useMoralisFunction';
import PayButton from '../buttons/payButton';
import useAccess from '../../../../hooks/useAccess';
import useCardStatus from '../../../../hooks/useCardStatus';
import { notify } from '../../settingsTab';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useCardCreate from '../../../../hooks/useCardCreate';
import { useCardContext } from '..';
import ConfirmModal from '../../../elements/confirmModal';

function OptionsPopover() {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const handleConfirmClose = () => setIsConfirmOpen(false);

  const { task, openPopover, anchorEl } = useCardContext();
  const { updateStatus } = useCardUpdate();
  const { createCard } = useCardCreate();
  const { statusToCode } = useCardStatus();

  const { isSpaceSteward } = useAccess(task);
  const duplicateCard = () => {
    handleClose();
    createCard(
      task.boardId,
      task.title,
      task.description,
      task.type,
      task.tags,
      task.deadline?.toISOString() as string,
      task.chain,
      task.token,
      task.value?.toString(),
      task.assignee,
      task.reviewer,
      task.columnId,
      handleClose
    );
  };
  const handleConfirm = () => updateStatus(statusToCode.archived);

  return (
    <>
      <IconButton
        data-testid="bCardOptionsButton"
        sx={{
          m: 0,
          px: 2,
          height: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          alignItems: 'start',
        }}
        onClick={openPopover(setOpen)}
      >
        <MoreHorizIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List
          sx={{
            width: '100%',
            maxWidth: 360,
            maxHeight: 200,
            overflow: 'auto',
            bgcolor: 'background.paper',
          }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <ListItemButton
            onClick={() => {
              const link = `${window.location.href}?taskId=${task.taskId}`;
              navigator.clipboard.writeText(link);
              notify('Task Link copied');
            }}
          >
            <IosShareIcon sx={{ width: '2rem', mr: 2 }} />
            <ListItemText primary="Share" />
          </ListItemButton>
          {isSpaceSteward() && (
            <ListItemButton onClick={duplicateCard}>
              <ContentCopyIcon sx={{ width: '2rem', mr: 2 }} />
              <ListItemText primary="Duplicate" />
            </ListItemButton>
          )}
          {isSpaceSteward() && (
            <ListItemButton
              data-testid="bArchiveCardButton"
              onClick={() => {
                setIsConfirmOpen(true);
              }}
            >
              <ArchiveIcon sx={{ width: '2rem', mr: 2 }} />
              <ListItemText primary="Archive" />
            </ListItemButton>
          )}
        </List>
      </Popover>
      <ConfirmModal
        isOpen={isConfirmOpen}
        handleClose={handleConfirmClose}
        buttonText="Yes, archive task"
        runOnConfirm={handleConfirm}
        modalContent="Are you sure you want to archive this task?"
      />
    </>
  );
}

export default OptionsPopover;
