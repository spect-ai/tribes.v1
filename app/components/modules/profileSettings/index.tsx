import styled from '@emotion/styled';
import { Controller, useForm } from 'react-hook-form';
import {
  Avatar,
  Grow,
  IconButton,
  Modal,
  TextField,
  Typography,
  styled as MUIStyled,
  Backdrop,
  CircularProgress,
  Box,
  InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useMoralis } from 'react-moralis';
import SettingsIcon from '@mui/icons-material/Settings';
// import validator from 'validator';
import { useRouter } from 'next/router';
import { PrimaryButton } from '../../elements/styledComponents';
import { OptionsButton } from '../themePopover';
import { ButtonText } from '../exploreSidebar';
import { useGlobal } from '../../../context/globalContext';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { useProfile } from '../../../../pages/profile/[username]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { notify } from '../settingsTab';

interface EditProfile {
  website: string;
  twitter: string;
  github: string;
}

type Props = {};

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '35%',
  transform: 'translate(-50%, -50%)',
  width: '30rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const Heading = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #eaeaea;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #5a6972;
  padding: 16px;
`;
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const FieldContainer = styled.div`
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function ProfileSettings(props: Props) {
  const { Moralis, user } = useMoralis();
  const { avatar } = useProfileInfo();
  const { profile, setProfile, setLoading } = useProfile();
  const { control } = useForm<EditProfile>();
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [twitterError, setTwitterError] = useState('');
  const [picture, setPicture] = useState('');
  // const [userEmail, setuserEmail] = useState(user?.get("email"));
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {
    state: { currentUser },
  } = useGlobal();
  const handleClose = () => setIsOpen(false);
  const { runMoralisFunction } = useMoralisFunction();

  useEffect(() => {
    setPicture(avatar);
  }, [avatar]);

  useEffect(() => {
    console.log(profile);
    setUsername(profile.username);
    setWebsite(profile.website);
    setGithub(profile.github);
    setTwitter(profile.twitter);
  }, [profile]);

  return (
    <>
      {/* {user?.get('username') === profile.username && ( */}
      <PrimaryButton
        data-testid="bConfirmAction"
        variant="outlined"
        sx={{ width: '6rem', height: '2rem', mx: 4, mt: 2 }}
        color="secondary"
        size="small"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Edit Profile
      </PrimaryButton>
      {/* )} */}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <Heading>
              <Typography sx={{ color: '#99ccff' }}>Profile</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              <Backdrop
                sx={{
                  color: '#eaeaea',
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress color="inherit" />
                  <Typography sx={{ mt: 2, mb: 1, color: '#eaeaea' }}>
                    Updating profile...
                  </Typography>
                </Box>
              </Backdrop>
              <FieldContainer>
                <Avatar src={picture} sx={{ height: 60, width: 60 }} />
                <input
                  accept="image/*"
                  hidden
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      setIsLoading(true);
                      const moralisFile = new Moralis.File(file.name, file);
                      user?.set('profilePicture', moralisFile);
                      user?.save().then((res: any) => {
                        setIsLoading(false);
                        setPicture(res.get('profilePicture')._url);
                      });
                    }
                  }}
                />
                <label htmlFor="contained-button-file">
                  {/* @ts-ignore */}
                  <PrimaryButton sx={{ borderRadius: 1 }} component="span">
                    Edit
                  </PrimaryButton>
                </label>
              </FieldContainer>
              <FieldContainer>
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  placeholder="Username"
                  size="small"
                  color="secondary"
                />
              </FieldContainer>
              <FieldContainer>
                <Controller
                  name="website"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      fullWidth
                      placeholder="https://my-website.com"
                      size="small"
                      color="secondary"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className="fas fa-link" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FieldContainer>
              <FieldContainer>
                <Controller
                  name="github"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value.startsWith('https://github.com/') || 'Invalid URL',
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      fullWidth
                      placeholder="https://github.com/my-github-username"
                      size="small"
                      color="secondary"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className="fa-brands fa-github" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FieldContainer>
              <FieldContainer>
                <Controller
                  name="twitter"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value.startsWith('https://twitter.com/') || 'Invalid URL',
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      fullWidth
                      placeholder="https://twitter.com/my-twitter-username"
                      size="small"
                      color="secondary"
                      id="standard-error-helper-text"
                      onBlur={() => {
                        if (!twitter.startsWith('https://twitter.com/'))
                          setTwitterError('Invalid URL');
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className="fa-brands fa-twitter" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FieldContainer>
              <PrimaryButton
                data-testid="bUpdateProfile"
                variant="outlined"
                sx={{
                  width: '6rem',
                  height: '2rem',
                  mx: 4,
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                color="secondary"
                size="small"
                onClick={() => {
                  setLoading(true);
                  runMoralisFunction('updateProfile', {
                    username,
                    website,
                    github,
                    twitter,
                  })
                    .then((res: any) => {
                      setIsOpen(false);
                      notify('Profile updated!', 'success');
                      router.push(`/profile/${username}`);
                      // setProfile(Object.assign(profile, res));
                      setLoading(false);
                    })
                    .catch((err: any) => {
                      notify(err.message, 'error');
                      setLoading(false);
                    });
                }}
              >
                Save
              </PrimaryButton>
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
}

export default ProfileSettings;
