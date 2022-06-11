import ArchiveIcon from '@mui/icons-material/Archive';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  IconButton,
  List,
  ListItemText,
  ListItemButton,
  Typography,
  Popover,
} from '@mui/material';
import React, { useState } from 'react';
import ConfirmModal from '../../elements/confirmModal';
import useAccess from '../../../hooks/useAccess';
import usePeriod from '../../../hooks/usePeriod';
import { Epoch } from '../../../types';

type Props = {
  period: Epoch;
  handleModalClose: () => void;
};

function OptionsPopover({ period, handleModalClose }: Props) {
  const { isSpaceSteward } = useAccess();
  const { archiveEpoch } = usePeriod();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openPopover = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setIsPopoverOpen(true);
  };
  const handleClose = () => {
    setIsPopoverOpen(false);
  };
  const handleConfirm = () => {
    archiveEpoch(period.objectId, period.spaceId);
  };
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    handleClose();
    handleModalClose();
  };

  return (
    <>
      <IconButton
        data-testid="bEpochOptionsButton"
        sx={{}}
        onClick={openPopover()}
      >
        <MoreHorizIcon
          sx={{
            display: 'flex',
            flexDirection: 'row',
            color: 'text.primary',
          }}
        />
      </IconButton>
      <Popover
        open={isPopoverOpen}
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
              //   const link = `${window.location.href}?periodId=${space.epo}`;
              //   navigator.clipboard.writeText(link);
              //   notify('Task Link copied');
            }}
          >
            <IosShareIcon sx={{ width: '2rem', mr: 2 }} />
            <ListItemText primary="Share" />
          </ListItemButton>
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
        <ConfirmModal
          isOpen={isConfirmOpen}
          handleClose={handleConfirmClose}
          buttonText="Yes, archive it"
          runOnConfirm={handleConfirm}
          modalContent={
            <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
              Are you sure you want to archive this retro period?
            </Typography>
          }
        />
      </Popover>
    </>
  );
}

export default OptionsPopover;
