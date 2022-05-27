import { Popover, useTheme } from '@mui/material';
import React from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { ButtonText } from '../exploreSidebar';
import { notify } from '../settingsTab';
import { OptionsButton, SidebarPopoverContainer } from '../themePopover';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
};

function ConnectPopover({ open, anchorEl, handleClose }: Props) {
  const { palette } = useTheme();
  const { logout, user, authenticate } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
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
        {!user?.get('discordId') && (
          <OptionsButton
            data-testid="bConnectMetamask"
            color="inherit"
            onClick={() => {
              try {
                authenticate()
                  .then(async () => {
                    await runMoralisFunction('getOrCreateUser', {});
                  })
                  .catch((err) => console.log(err));
              } catch (err) {
                notify('Error occured, try again', 'error');
              }
            }}
          >
            <ButtonText>Metamask</ButtonText>
          </OptionsButton>
        )}
        <OptionsButton
          data-testid="bWalletConnect"
          color="inherit"
          onClick={() => {
            try {
              authenticate({ provider: 'walletConnect' })
                .then(async () => {
                  await runMoralisFunction('getOrCreateUser', {});
                })
                .catch((err) => console.log(err));
            } catch (err) {
              notify('Error occured, try again', 'error');
            }
          }}
        >
          <ButtonText>Wallet Connect</ButtonText>
        </OptionsButton>
      </SidebarPopoverContainer>
    </Popover>
  );
}

export default ConnectPopover;
