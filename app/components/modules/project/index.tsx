import { Box, Grow } from '@mui/material';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData } from '../../../types';
import { reorder } from '../../../utils/utils';
import { PrimaryButton } from '../../elements/styledComponents';
import BoardView from '../boardView';
import ForumView from '../forumView';
import TrelloImport from '../importTrello';
import ListView from '../listView';
import { notify } from '../settingsTab';
import TasksFilter, { filterTasks } from '../tasksFilter';
import ViewsNavbar from '../viewsNavbar';

interface ProjectContextType {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  // handleDragEnd: (result: DropResult) => void;
}

const ProjectContext = createContext<ProjectContextType>(
  {} as ProjectContextType
);

function useProviderProject() {
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return {
    tab,
    handleTabChange,
    isLoading,
    setIsLoading,
  };
}

function Project() {
  const { space, setSpace, setFilteredTasks, currentFilter } = useSpace();
  const router = useRouter();
  const { bid } = router.query;
  const { user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  const context = useProviderProject();
  const { tab } = context;

  useEffect(() => {
    console.log('space changed');
    setFilteredTasks(filterTasks(space, currentFilter));
  }, [space]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    const task = space.tasks[draggableId];
    if (
      type !== 'column' &&
      !(
        task.access.assignee ||
        task.access.creator ||
        task.access.reviewer ||
        [2, 3].includes(space.roles[user?.id as string])
      )
    ) {
      notify("Looks like you don't have access to move this task", 'error');
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (type === 'column') {
      const newColumnOrder = reorder(
        space.columnOrder,
        source.index,
        destination.index
      );
      const tempData = { ...space };
      setSpace({
        ...space,
        columnOrder: newColumnOrder,
      });
      runMoralisFunction('updateColumnOrder', {
        boardId: bid,
        newColumnOrder,
      })
        .then((res: BoardData) => {
          setSpace(res);
        })
        .catch(() => {
          setSpace(tempData);
          notify(
            'Sorry! There was an error while changing the column order.',
            'error'
          );
        });
      return;
    }

    const start = space.columns[source.droppableId];
    const finish = space.columns[destination.droppableId];

    if (start === finish) {
      const newList = reorder(start.taskIds, source.index, destination.index);
      const tempData = { ...space };
      setSpace({
        ...space,
        columns: {
          ...space.columns,
          [result.source.droppableId]: {
            ...space.columns[result.source.droppableId],
            taskIds: newList,
          },
        },
      });
      runMoralisFunction('updateColumnTasks', {
        boardId: bid,
        taskId: draggableId,
        updatedCardLoc: {
          columnId: result.source.droppableId,
          cardIndex: destination.index,
        },
      })
        .then((res: BoardData) => {
          setSpace(res);
        })
        .catch((err: any) => {
          setSpace(tempData);
          notify(`${err.message}`, 'error');
        });
    } else {
      const startTaskIds = Array.from(start.taskIds); // copy
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finish.taskIds); // copy
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      };
      const tempData = { ...space };
      setSpace({
        ...space,
        columns: {
          ...space.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });
      runMoralisFunction('updateColumnTasks', {
        boardId: bid,
        taskId: draggableId,
        updatedCardLoc: {
          columnId: newFinish.id,
          cardIndex: destination.index,
        },
      })
        .then((res: BoardData) => {
          setSpace(res);
        })
        .catch((err: any) => {
          setSpace(tempData);
          notify(`${err.message}`, 'error');
        });
    }
  };

  return (
    <ProjectContext.Provider value={context}>
      <Box sx={{ ml: 4 }}>
        <ViewsNavbar />
        <TrelloImport isOpen={isOpen} handleClose={handleClose} />
        {Object.keys(space.tasks).length === 0 &&
          space.roles[user?.id as string] === 3 && (
            <PrimaryButton
              variant="outlined"
              sx={{ borderRadius: 1, ml: 2 }}
              color="secondary"
              size="small"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              Import cards from Trello
            </PrimaryButton>
          )}
        {tab === 0 && (
          <Grow in={tab === 0} timeout={500}>
            <div>
              <BoardView handleDragEnd={handleDragEnd} />
            </div>
          </Grow>
        )}
        {tab === 1 && (
          <Grow in={tab === 1} timeout={500}>
            <div>
              <ListView handleDragEnd={handleDragEnd} />
            </div>
          </Grow>
        )}
        {tab === 2 && (
          <Grow in={tab === 2} timeout={500}>
            <div>
              <ForumView />
            </div>
          </Grow>
        )}
      </Box>
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);

export default Project;
