import styled from '@emotion/styled';
import { Box, createTheme, Theme, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import NotFound from '../../../../app/components/elements/notFound';
import ExploreSidebar from '../../../../app/components/modules/exploreSidebar';
import SpaceNavbar from '../../../../app/components/modules/spaceNavbar';
import BoardsTemplate from '../../../../app/components/templates/space';
import getTheme from '../../../../app/constants/muiTheme';
import { useGlobal } from '../../../../app/context/globalContext';
import useMoralisFunction from '../../../../app/hooks/useMoralisFunction';
import { BoardData, Task, Column } from '../../../../app/types';
import { notify } from '../../../../app/components/modules/settingsTab';
import { CurrentFilter } from '../../../../app/components/modules/tasksFilter';

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
  filteredColumns: { [key: string]: Column };
  setFilteredColumns: (filteredColumns: { [key: string]: Column }) => void;
  filteredTasks: { [key: string]: Task };
  setFilteredTasks: (filteredTasks: { [key: string]: Task }) => void;
  currentFilter: CurrentFilter;
  setCurrentFilter: (currentFilter: CurrentFilter) => void;
}

const SpaceContext = createContext<SpaceContextType>({} as SpaceContextType);

function useProviderSpace() {
  const [space, setSpace] = useState<BoardData>({} as BoardData);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [themeChanged, setThemeChanged] = useState(false);
  const [refreshEpochs, setRefreshEpochs] = useState(false);
  const [filteredColumns, setFilteredColumns] = useState<{
    [key: string]: Column;
  }>({} as { [key: string]: Column });
  const [filteredTasks, setFilteredTasks] = useState<{ [key: string]: Task }>(
    {} as { [key: string]: Task }
  );
  const [currentFilter, setCurrentFilter] = useState<CurrentFilter>(
    {} as CurrentFilter
  );
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
    filteredColumns,
    setFilteredColumns,
    filteredTasks,
    setFilteredTasks,
    currentFilter,
    setCurrentFilter,
  };
}

export const PageContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette?.background.default};
`;
console.log('starting space page', new Date());
export default function SpacePage() {
  const context = useProviderSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const {
    state: { loading },
  } = useGlobal();
  const { setSpace, setIsLoading, setFilteredTasks } = context;
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [theme, setTheme] = useState<Theme>(createTheme(getTheme(0)));

  const router = useRouter();
  const { bid } = router.query;

  useEffect(() => {
    setTheme(createTheme(getTheme(0)));
    setIsLoading(true);
    if (!loading && bid) {
      runMoralisFunction('getSpace', { boardId: bid })
        .then((res) => {
          setSpace(res);
          setFilteredTasks(res.tasks);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.message === 'Space not found') {
            setNotFound(true);
          }
          if (err.message === "You don't have access to view this space") {
            setIsPrivate(true);
          }
          notify(err.message, 'error');
          setIsLoading(false);
        });
    }
  }, [loading, bid]);
  return (
    <>
      <Head>
        <title>Spect Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <SpaceContext.Provider value={context}>
        <ThemeProvider theme={theme}>
          <PageContainer theme={createTheme(getTheme(0))}>
            <SpaceNavbar />

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <ExploreSidebar />
              {!notFound && !isPrivate && <BoardsTemplate />}
              {notFound && <NotFound text="Space not found" />}
              {isPrivate && (
                <NotFound text="You don't have access to view this space" />
              )}
            </Box>
          </PageContainer>
        </ThemeProvider>
      </SpaceContext.Provider>
    </>
  );
}

export const useSpace = () => useContext(SpaceContext);
