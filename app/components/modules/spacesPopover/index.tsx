import { Popover, useTheme } from '@mui/material';
import React from 'react';
import { OptionsButton, SidebarPopoverContainer } from '../themePopover';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

function SpacesPopover({ open, anchorEl, handleClose, type }: Props) {
  const { palette } = useTheme();
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <SidebarPopoverContainer palette={palette}>
        <OptionsButton color="inherit">Test 3</OptionsButton>
      </SidebarPopoverContainer>
    </Popover>
  );
}

export default SpacesPopover;
