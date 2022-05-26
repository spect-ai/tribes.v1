import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, IconButton, InputBase, Palette, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Column, Task } from '../../../types';
import CardModal from '../cardModal';
import CreateCard from '../cardModal/createCard';
import ColumnSettings from '../columnSettings';
import { notify } from '../settingsTab';
import TaskContainer, { Chip } from '../task';

type Props = {
  tasks: Task[];
  id: string;
  column: Column;
  index: number;
};

const TaskTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.2rem;
`;

const OuterContainer = styled.div`
  margin: 0.3rem 1rem 1rem 0rem;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  height: fit-content;
  max-height: calc(100vh - 10rem);
`;

const TaskListContainer = styled.div<{ palette: Palette }>`
  box-shadow: 0 10px 30px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  background-color: ${(props) => props.palette.primary.main};
  border-radius: 0.3rem;
`;

const Container = styled.div<{ isDragging: boolean; palette: Palette }>`
  display: flex;
  flex-direction: column;
  border-radius: 0.3rem;
  border: ${(props) =>
    props.isDragging
      ? `0.5px solid ${props.palette.primary.light}`
      : '0.5px solid transparent'};
  min-width: 20rem;
  transition: 0.5s ease-in-out;
`;

export default function ColumnComponent({ tasks, id, column, index }: Props) {
  const { user } = useMoralis();
  const router = useRouter();
  const { space, setSpace } = useSpace();
  const { bid } = router.query;

  const [showCreateTask, setShowCreateTask] = useState(false);
  // const [showCreateGithubTask, setShowCreateGithubTask] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const handleTaskClose = () => setIsTaskOpen(false);
  const [taskId, setTaskId] = useState('');
  const [currentColumnTitle, setCurrentColumnTitle] = useState(column.title);
  const { runMoralisFunction } = useMoralisFunction();
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleModalClose = () => {
    setIsOpen(false);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const { palette } = useTheme();

  const handleCreateCardClose = () => {
    setShowCreateTask(false);
  };

  function updateColumn() {
    if (currentColumnTitle !== columnTitle) {
      runMoralisFunction('updateColumnName', {
        boardId: bid,
        columnId: id,
        newName: columnTitle,
      })
        .then((res: BoardData) => {
          console.log(res);
          setSpace(res);
        })
        .catch((err: any) => {
          notify(
            'Sorry! There was an error while updating column name',
            'error'
          );
        });
    }
  }

  useEffect(() => {
    setColumnTitle(space.columns[column.id].title);
  }, [space]);

  return (
    <OuterContainer>
      {isOpen && (
        <ColumnSettings
          isOpen={isOpen}
          handleClose={handleModalClose}
          column={column}
        />
      )}
      <CardModal
        isOpen={isTaskOpen}
        handleClose={handleTaskClose}
        taskId={taskId}
        columnId={column.id}
      />
      <Draggable
        draggableId={id}
        index={index}
        isDragDisabled={space.roles[user?.id as string] !== 3}
      >
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
            ref={provided.innerRef}
            palette={palette}
          >
            <Droppable droppableId={id} type="task">
              {(provided2) => (
                <TaskListContainer
                  {...provided2.droppableProps}
                  ref={provided2.innerRef}
                  palette={palette}
                >
                  <TaskTitleContainer>
                    <InputBase
                      placeholder="Add Title"
                      sx={{
                        fontSize: '15px',
                        marginLeft: '6px',
                        width: 'fit-content',
                      }}
                      value={columnTitle}
                      onChange={(e) => setColumnTitle(e.target.value)}
                      onBlur={() => updateColumn()}
                      readOnly={space.roles[user?.id as string] !== 3}
                    />
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Chip
                      color="rgb(153, 204, 255, 0.2)"
                      style={{ marginTop: 5, marginBottom: 0 }}
                    >
                      {tasks?.length}
                    </Chip>
                    <IconButton
                      data-testid={`addTask-${column.id}`}
                      sx={{ mb: 0.5, p: 1 }}
                      size="small"
                      onClick={() => {
                        if (
                          !column.createCard[space.roles[user?.id as string]] &&
                          !column.createCard[0]
                        ) {
                          notify(
                            "Your role doesn't have permission to create cards in this column",
                            'error'
                          );
                          return;
                        }
                        setShowCreateTask(true);
                      }}
                    >
                      <AddIcon fontSize="small" color="secondary" />
                    </IconButton>
                    <IconButton
                      sx={{ mb: 0.5, p: 1 }}
                      size="small"
                      onClick={() => setIsOpen(true)}
                      disabled={space.roles[user?.id as string] !== 3}
                    >
                      <SettingsIcon fontSize="small" color="secondary" />
                    </IconButton>
                  </TaskTitleContainer>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }} />
                  <TaskList>
                    {tasks?.map((task, idx) => {
                      if (task) {
                        return (
                          <TaskContainer
                            key={task?.taskId}
                            task={task}
                            index={idx}
                            column={column}
                          />
                        );
                      }
                      return <div />;
                    })}
                    {provided2.placeholder}
                    {/* <CreateTask
                      showCreateTask={showCreateTask}
                      setShowCreateTask={setShowCreateTask}
                      columnId={id}
                    />

                    {showCreateGithubTask && (
                      <CreateGithubTask
                        setShowCreateTask={setShowCreateGithubTask}
                        columnId={id}
                      />
                    )} */}
                  </TaskList>
                </TaskListContainer>
              )}
            </Droppable>
          </Container>
        )}
      </Draggable>
      <CreateCard
        isOpen={showCreateTask}
        handleClose={handleCreateCardClose}
        column={column}
      />
    </OuterContainer>
  );
}
