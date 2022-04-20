import { Box, createTheme, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import ExploreSidebar from '../app/components/modules/exploreSidebar';
import Navbar from '../app/components/modules/navbar';
import ExploreTemplate from '../app/components/templates/explore';
import getTheme from '../app/constants/muiTheme';
import useMoralisFunction from '../app/hooks/useMoralisFunction';
import { Team } from '../app/types';
import { PageContainer } from './tribe/[id]/space/[bid]';

interface ExploreContextType {
  publicTribes: Team[];
  setPublicTribes: (publicTribes: Team[]) => void;
  myTribes: any[];
  setMyTribes: (myTribes: any[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  tab: number;
  setTab: (tab: number) => void;
}

export const ExploreContext = createContext<ExploreContextType>(
  {} as ExploreContextType
);

function useProviderExplore() {
  const [publicTribes, setPublicTribes] = useState<Team[]>([] as Team[]);
  const [myTribes, setMyTribes] = useState<any[]>([] as any[]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  return {
    publicTribes,
    setPublicTribes,
    myTribes,
    setMyTribes,
    loading,
    setLoading,
    tab,
    setTab,
  };
}

console.log('starting index page', new Date());
export default function Home() {
  const { isInitialized, isAuthenticated } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const context = useProviderExplore();
  const { setMyTribes, setLoading, setPublicTribes } = context;
  const initializeExploreAfterWalletConnect = async () => {
    setLoading(true);
    try {
      const myTeams = await runMoralisFunction('getMyTeams', {});
      setMyTribes(myTeams);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const initializeExploreBeforeWalletConnect = async () => {
    setLoading(true);
    try {
      const publicTeams = await runMoralisFunction('getPublicTeams', {});
      setPublicTribes(publicTeams);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      initializeExploreBeforeWalletConnect();
      if (isAuthenticated) {
        initializeExploreAfterWalletConnect();
      }
      if (!isAuthenticated) {
        setMyTribes([]);
      }
    }
  }, [isInitialized, isAuthenticated]);
  return (
    <>
      <Head>
        <title>Spect Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <ThemeProvider theme={createTheme(getTheme(0))}>
        <ExploreContext.Provider value={context}>
          <PageContainer theme={createTheme(getTheme(0))}>
            <Navbar />
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <ExploreSidebar />
              <ExploreTemplate />
            </Box>
          </PageContainer>
        </ExploreContext.Provider>
      </ThemeProvider>
    </>
  );
}

export const useExplore = () => useContext(ExploreContext);
