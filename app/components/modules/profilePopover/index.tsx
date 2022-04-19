import LogoutIcon from '@mui/icons-material/Logout';
import { Popover, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useMoralis } from 'react-moralis';
import { updateUser, useGlobal } from '../../../context/globalContext';
import { ButtonText } from '../exploreSidebar';
import ProfileSettings from '../profileSettings';
import { OptionsButton, SidebarPopoverContainer } from '../themePopover';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
};

function ProfilePopover({ open, anchorEl, handleClose }: Props) {
  const { palette } = useTheme();
  const { logout, user } = useMoralis();
  const router = useRouter();
  const { dispatch } = useGlobal();
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
            color="inherit"
            onClick={() => {
              router.push(
                `https://discord.com/api/oauth2/authorize?client_id=942494607239958609&redirect_uri=${
                  process.env.DEV_ENV === 'local'
                    ? 'http%3A%2F%2Flocalhost%3A3000%2F'
                    : 'https%3A%2F%2Ftribes.spect.network%2F'
                }&response_type=code&scope=identify`
              );
            }}
          >
            <i className="fa-brands fa-discord" />
            <ButtonText>Link Discord</ButtonText>
          </OptionsButton>
        )}
        <ProfileSettings />
        <OptionsButton
          color="inherit"
          onClick={() => {
            // localStorage.removeItem("objectId");
            updateUser(dispatch, {});
            logout();
            router.push('/');
            handleClose();
          }}
        >
          <LogoutIcon />
          <ButtonText>Logout</ButtonText>
        </OptionsButton>
      </SidebarPopoverContainer>
    </Popover>
  );
}

export default ProfilePopover;
