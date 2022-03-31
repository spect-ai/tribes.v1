import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";
import Head from "next/head";
import styled from "@emotion/styled";
import {
  Box,
  createTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";
import { BoardData, Team } from "../../../../app/types";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { getSpace } from "../../../../app/adapters/moralis";
import { notify } from "../../../../app/components/modules/settingsTab";
import { getTheme } from "../../../../app/constants/muiTheme";
import SpaceNavbar from "../../../../app/components/modules/spaceNavbar";
import ExploreSidebar from "../../../../app/components/modules/exploreSidebar";
import NotFound from "../../../../app/components/elements/notFound";
import { useDiscord } from "../../../../app/hooks/useDiscord";
import { useGlobal } from "../../../../app/context/globalContext";
import { useMoralisFunction } from "../../../../app/hooks/useMoralisFunction";

interface Props {}
interface SpaceContextType {
  space: BoardData;
  setSpace: (data: BoardData) => void;
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  themeChanged: boolean;
  setThemeChanged: (themeChanged: boolean) => void;
  refreshEpochs: boolean;
  setRefreshEpochs: (refreshEpochs: boolean) => void;
}

const SpaceContext = createContext<SpaceContextType>({} as SpaceContextType);
console.log("starting space page", new Date());
const SpacePage: NextPage<Props> = (props: Props) => {
  const { Moralis, isInitialized, user } = useMoralis();
  const context = useProviderSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const {
    state: { currentUser },
  } = useGlobal();
  const { setSpace, setIsLoading, themeChanged } = context;
  const [notFound, setNotFound] = useState(false);

  const [theme, setTheme] = useState<Theme>(createTheme(getTheme(0)));

  const router = useRouter();
  const { bid } = router.query;

  useEffect(() => {
    setTheme(createTheme(getTheme(0)));
    setIsLoading(true);
    if (isInitialized && bid) {
      // getSpace(Moralis, bid as string)
      //   .then((res: BoardData) => {
      // console.log(res);

      // setSpace(res);
      // setTheme(createTheme(getTheme(res.team[0].theme)));
      // setIsLoading(false);
      //   })
      //   .catch((err: any) => {
      //     console.log(err);
      //     setNotFound(true);
      //     setIsLoading(false);
      //   });
      runMoralisFunction("getSpace", { boardId: bid }).then((res) => {
        console.log(res);
        setSpace(res);
        setIsLoading(false);
      });
    }
  }, [isInitialized, bid]);
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <SpaceContext.Provider value={context}>
        <ThemeProvider theme={theme}>
          <PageContainer theme={createTheme(getTheme(0))}>
            {!notFound && <SpaceNavbar />}

            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <ExploreSidebar />
              {!notFound && <BoardsTemplate />}
              {notFound && <NotFound text="Space not found" />}
            </Box>
          </PageContainer>
        </ThemeProvider>
      </SpaceContext.Provider>
    </>
  );
};

export const PageContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette?.background.default};
`;

function useProviderSpace() {
  const [space, setSpace] = useState<BoardData>({} as BoardData);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [themeChanged, setThemeChanged] = useState(false);
  const [refreshEpochs, setRefreshEpochs] = useState(false);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return {
    space,
    setSpace,
    tab,
    handleTabChange,
    isLoading,
    setIsLoading,
    themeChanged,
    setThemeChanged,
    refreshEpochs,
    setRefreshEpochs,
  };
}

export const useSpace = () => useContext(SpaceContext);

export default SpacePage;
