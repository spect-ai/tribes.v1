import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";
import Head from "next/head";
import styled from "@emotion/styled";
import Sidebar from "../../../../app/components/modules/sidebar";
import { createTheme, Theme, ThemeProvider, useTheme } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";
import { BoardData } from "../../../../app/types";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { getSpace } from "../../../../app/adapters/moralis";
import { notify } from "../../../../app/components/modules/settingsTab";

interface Props {}
interface SpaceContextType {
  space: BoardData;
  setSpace: (data: BoardData) => void;
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const SpaceContext = createContext<SpaceContextType>({} as SpaceContextType);

const SpacePage: NextPage<Props> = (props: Props) => {
  const { palette } = useTheme();
  const theme = createTheme();
  const { Moralis, isInitialized, user } = useMoralis();
  const context = useProviderSpace();
  const { space, setSpace, tab, handleTabChange, setIsLoading } = context;

  const router = useRouter();
  const { bid } = router.query;

  useEffect(() => {
    setIsLoading(true);
    if (isInitialized && bid) {
      getSpace(Moralis, bid as string)
        .then((res: BoardData) => {
          console.log(res);
          setSpace(res);
          setIsLoading(false);
        })
        .catch((err: any) => {
          notify(err.message, "error");
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
          <PageContainer theme={theme}>
            <Sidebar />
            <BoardsTemplate />
          </PageContainer>
        </ThemeProvider>
      </SpaceContext.Provider>
    </>
  );
};

export const PageContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette.background.default};
`;

function useProviderSpace() {
  const [space, setSpace] = useState<BoardData>({} as BoardData);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
  };
}

export const useSpace = () => useContext(SpaceContext);

export default SpacePage;
