import { Box, createTheme, Theme, ThemeProvider } from '@mui/material';
import styled from '@emotion/styled';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import NotFound from '../../app/components/elements/notFound';
import ExploreSidebar from '../../app/components/modules/exploreSidebar';
import getTheme from '../../app/constants/muiTheme';
import { useGlobal } from '../../app/context/globalContext';
import { Profile } from '../../app/types';
import ProfileNavbar from '../../app/components/modules/profileNavbar';
import ProfileTemplate from '../../app/components/templates/profile';
import useMoralisFunction from '../../app/hooks/useMoralisFunction';

export const ProfileContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette?.background.default};
`;

interface Props {}

interface ProfileContextType {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  profile: Profile;
  setProfile: (tribe: Profile) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ProfileContext = createContext<ProfileContextType>(
  {} as ProfileContextType
);

function useProviderProfile() {
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({} as Profile);
  const [loading, setLoading] = useState(true);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return {
    tab,
    handleTabChange,
    profile,
    setProfile,
    loading,
    setLoading,
  };
}

console.log('starting profile page', new Date());
export default function ProfilePage(props: Props) {
  const router = useRouter();
  const { username } = router.query;
  const {
    state: { loading },
  } = useGlobal();
  const context = useProviderProfile();
  const { state } = useGlobal();
  const { setLoading, setProfile } = context;
  const [theme, setTheme] = useState<Theme>(createTheme(getTheme(0)));
  const { isAuthenticated, isInitialized } = useMoralis();
  const [notFound, setNotFound] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();

  useEffect(() => {
    if (!loading && isInitialized && username) {
      setTheme(createTheme(getTheme(0)));
      setLoading(true);
      const params = {
        username,
      };
      runMoralisFunction('getUserDetailsWithUsername', params)
        .then((res: any) => {
          setProfile(res as Profile);
          setTheme(createTheme(getTheme(res.theme)));
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          setNotFound(true);
          setLoading(false);
        });
    }
  }, [username]);
  return (
    <>
      <Head>
        <title>{username ? `${username} | Spect` : 'Spect'}</title>
        <meta name="description" content="Manage DAO with ease " />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <ThemeProvider theme={theme}>
        <ProfileContext.Provider value={context}>
          <ProfileContainer theme={createTheme(getTheme(0))}>
            {!notFound && <ProfileNavbar />}
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <ExploreSidebar />
              {!notFound && <ProfileTemplate />}
              {notFound && <NotFound text="Profile not found" />}
            </Box>
          </ProfileContainer>
        </ProfileContext.Provider>
      </ThemeProvider>
    </>
  );
}

export const useProfile = () => useContext(ProfileContext);
