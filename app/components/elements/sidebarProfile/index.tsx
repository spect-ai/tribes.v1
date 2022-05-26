import styled from '@emotion/styled';
import LoginIcon from '@mui/icons-material/Login';
import { Avatar, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import useProfileInfo from '../../../hooks/useProfileInfo';
import ConnectPopover from '../../modules/connectPopover';
import ProfilePopover from '../../modules/profilePopover';
import { SidebarButton } from '../styledComponents';

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  @media only screen and (min-width: 0px) {
    margin-right: 0.2rem;
  }
  @media only screen and (min-width: 768px) {
    margin-right: 1rem;
  }
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

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const handleConnectClose = () => {
    setIsConnectOpen(false);
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
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
              setIsConnectOpen(true);
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
      <ConnectPopover
        open={isConnectOpen}
        anchorEl={anchorEl}
        handleClose={handleConnectClose}
      />
    </Profile>
  );
}

export default SidebarProfile;
