import { Box, createTheme, Theme, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import NotFound from '../../../app/components/elements/notFound';
import ExploreSidebar from '../../../app/components/modules/exploreSidebar';
import TribeNavbar from '../../../app/components/modules/tribeNavbar';
import TribeTemplate from '../../../app/components/templates/tribe';
import getTheme from '../../../app/constants/muiTheme';
import { useGlobal } from '../../../app/context/globalContext';
import { Team } from '../../../app/types';
import { PageContainer } from './space/[bid]';

interface Props {}

interface TribeContextType {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  tribe: Team;
  setTribe: (tribe: Team) => void;
  getTeam: Function;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isMember: boolean;
  setIsMember: (isMember: boolean) => void;
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

function useProviderTribe() {
  const [tab, setTab] = useState(0);
  const [tribe, setTribe] = useState({} as Team);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const { fetch: getTeam } = useMoralisCloudFunction(
    'getTeam',
    {
      limit: 1,
    },
    { autoFetch: false }
  );

  return {
    tab,
    handleTabChange,
    tribe,
    setTribe,
    getTeam,
    loading,
    setLoading,
    isMember,
    setIsMember,
  };
}

console.log('starting tribe page', new Date());
export default function TribePage(props: Props) {
  const router = useRouter();
  const { id } = router.query;
  const context = useProviderTribe();
  const { state } = useGlobal();
  const { setLoading, getTeam, setTribe, isMember } = context;
  const [theme, setTheme] = useState<Theme>(createTheme(getTheme(0)));
  const { isAuthenticated, isInitialized, user, isUserUpdating } = useMoralis();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isInitialized && id) {
      setTheme(createTheme(getTheme(0)));
      setLoading(true);
      getTeam({
        onSuccess: (res: any) => {
          console.log(res);
          setTribe(res as Team);
          setTheme(createTheme(getTheme(res.theme)));
          setLoading(false);
        },
        onError: (err: any) => {
          console.log(err);
          setNotFound(true);
          setLoading(false);
        },
        params: {
          teamId: id,
        },
      });
    }
  }, [id, isMember, isAuthenticated, isInitialized]);
  return (
    <>
      <Head>
        <title>Spect Tribes</title>
        <meta name="description" content="Manage DAO with ease " />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <ThemeProvider theme={theme}>
        <TribeContext.Provider value={context}>
          <PageContainer theme={createTheme(getTheme(0))}>
            {!notFound && <TribeNavbar />}
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <ExploreSidebar />
              {!notFound && <TribeTemplate />}
              {notFound && <NotFound text="Tribe not found" />}
            </Box>
          </PageContainer>
        </TribeContext.Provider>
      </ThemeProvider>
    </>
  );
}

export const useTribe = () => useContext(TribeContext);
