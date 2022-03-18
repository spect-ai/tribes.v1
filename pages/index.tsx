import type { NextPage } from "next";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Box,
  styled,
  Typography,
  Avatar,
  Grid,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Link from "next/link";

import { createContext, useContext, useEffect, useState } from "react";
import { getMyTeams, getPublicTeams } from "../app/adapters/moralis";
import { useMoralis } from "react-moralis";
import { Team } from "../app/types";

import { tribesLogo } from "../app/constants";
import Head from "next/head";
import Navbar from "../app/components/modules/navbar";
import ExploreTemplate from "../app/components/templates/explore";
import { getTheme } from "../app/constants/muiTheme";
import { PageContainer } from "./tribe/[id]/space/[bid]";
import ExploreSidebar from "../app/components/modules/exploreSidebar";

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

const Home: NextPage = () => {
  const { Moralis, isInitialized, isAuthenticated } = useMoralis();
  const context = useProviderExplore();
  const { setMyTribes, setLoading, setPublicTribes } = context;
  const initializeExploreAfterWalletConnect = async () => {
    setLoading(true);
    try {
      const myTeams = await getMyTeams(Moralis);
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
      const publicTeams = await getPublicTeams(Moralis);
      setPublicTribes(publicTeams);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      initializeExploreBeforeWalletConnect();
      console.log(isAuthenticated);
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
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <ExploreSidebar />
              <ExploreTemplate />
            </Box>
          </PageContainer>
        </ExploreContext.Provider>
      </ThemeProvider>
    </>
  );
};

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

export const useExplore = () => useContext(ExploreContext);

export default Home;
