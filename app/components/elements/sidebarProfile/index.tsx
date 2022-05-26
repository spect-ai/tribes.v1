import styled from '@emotion/styled';
import LoginIcon from '@mui/icons-material/Login';
import { Avatar, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import useProfileInfo from '../../../hooks/useProfileInfo';
import ProfilePopover from '../../modules/profilePopover';
import { notify } from '../../modules/settingsTab';
import { SidebarButton } from '../styledComponents';

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  margin-right: 1rem;
`;

function SidebarProfile() {
  const { isAuthenticated, authenticate, isAuthenticating } = useMoralis();
  const { avatar } = useProfileInfo();
  const { runMoralisFunction } = useMoralisFunction();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClosePopover = () => {
    setOpen(false);
  };
  return (
    <Profile>
      {!isAuthenticated && (
        <>
          <SidebarButton
            data-testid="bConnectButton"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
            color="inherit"
            loading={isAuthenticating}
            onClick={() => {
              authenticate()
                .then(async () => {
                  await runMoralisFunction('getOrCreateUser', {});
                })
                .catch((err) => console.log(err));
            }}
          >
            <LoginIcon />
            <Typography sx={{ textTransform: 'none', fontSize: 14, ml: 2 }}>
              Connect
            </Typography>
          </SidebarButton>
          <SidebarButton
            data-testid="bConnectButton"
            sx={{
              display: {
                xs: 'flex',
                md: 'none',
              },
            }}
            color="inherit"
            loading={isAuthenticating}
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
            <LoginIcon />
            <Typography sx={{ textTransform: 'none', fontSize: 14, ml: 2 }}>
              Connect
            </Typography>
          </SidebarButton>
        </>
      )}
      {isAuthenticated && (
        <SidebarButton
          data-testid="bProfileButton"
          sx={{ mt: 2 }}
          color="inherit"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            setOpen(true);
          }}
        >
          <Avatar sx={{ p: 0, m: 0, width: 32, height: 32 }} src={avatar} />
        </SidebarButton>
      )}
      <ProfilePopover
        open={open}
        anchorEl={anchorEl}
        handleClose={handleClosePopover}
      />
    </Profile>
  );
}

export default SidebarProfile;
