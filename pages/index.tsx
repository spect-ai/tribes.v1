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
import {
  StyledTab,
  StyledTabs,
} from "../app/components/elements/styledComponents";
import { createContext, useContext, useEffect, useState } from "react";
import { getMyTeams, getPublicTeams } from "../app/adapters/moralis";
import { useMoralis } from "react-moralis";
import { Team } from "../app/types";
import {
  setNavbarLogo,
  setNavbarTitle,
  useGlobal,
} from "../app/context/globalContext";
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
  myTribes: Team[];
  setMyTribes: (myTribes: Team[]) => void;
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
  const initializeExplore = async () => {
    setLoading(true);
    try {
      const publicTeams = await getPublicTeams(Moralis);
      const myTeams = await getMyTeams(Moralis);
      setPublicTribes(publicTeams);
      setMyTribes(myTeams);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      initializeExplore();
    }
  }, [isInitialized, isAuthenticated]);
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <ThemeProvider theme={createTheme(getTheme(0))}>
        <PageContainer theme={createTheme(getTheme(0))}>
          <ExploreContext.Provider value={context}>
            <ExploreSidebar />
            <ExploreTemplate />
          </ExploreContext.Provider>
        </PageContainer>
      </ThemeProvider>
    </>
  );
};

function useProviderExplore() {
  const [publicTribes, setPublicTribes] = useState<Team[]>([] as Team[]);
  const [myTribes, setMyTribes] = useState<Team[]>([] as Team[]);
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
