import styled from "@emotion/styled";
import {
  Button,
  InputBase,
  IconButton,
  useTheme,
  Palette,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import AddIcon from "@mui/icons-material/Add";

import { Box } from "@mui/system";
import SettingsIcon from "@mui/icons-material/Settings";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useMoralis } from "react-moralis";
import { updateColumnName } from "../../../adapters/moralis";
import { useRouter } from "next/router";
import { BoardData, Column, Task } from "../../../types";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { notify } from "../settingsTab";
import CreateTask from "../task/createTask";
import TaskContainer from "../task";
import CreateGithubTask from "../task/createGithubTask";
import ColumnSettings from "../columnSettings";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import CardModal from "../cardModal";

type Props = {
  tasks: Task[];
  id: string;
  column: Column;
  index: number;
};

const Column = ({ tasks, id, column, index }: Props) => {
  const { Moralis, user } = useMoralis();
  const router = useRouter();
  const { space, setSpace } = useSpace();
  const { bid } = router.query;

  // const [showCreateTask, setShowCreateTask] = useState(false);
  // const [showCreateGithubTask, setShowCreateGithubTask] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const handleTaskClose = () => setIsTaskOpen(false);
  const [taskId, setTaskId] = useState("");
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

  function updateColumn() {
    if (currentColumnTitle !== columnTitle) {
      updateColumnName(Moralis, bid as string, id, columnTitle)
        .then((res: BoardData) => {
          console.log(res);
          setSpace(res);
        })
        .catch((err: any) => {
          notify(
            "Sorry! There was an error while updating column name",
            "error"
          );
        });
    }
  }
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
              {(provided) => (
                <TaskListContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  palette={palette}
                >
                  <TaskTitleContainer>
                    <InputBase
                      placeholder="Add Title"
                      sx={{
                        fontSize: "15px",
                        marginLeft: "6px",
                      }}
                      value={columnTitle}
                      onChange={(e) => setColumnTitle(e.target.value)}
                      onBlur={updateColumn}
                      readOnly={space.roles[user?.id as string] !== 3}
                    />
                    <Box sx={{ flex: "1 1 auto" }} />
                    <IconButton
                      sx={{ mb: 0.5, p: 1 }}
                      size="small"
                      onClick={() => {
                        if (
                          !column.createCard[space.roles[user?.id as string]] &&
                          !column.createCard[0]
                        ) {
                          notify(
                            "Your role doesn't have permission to create tasks in this column",
                            "error"
                          );
                          return;
                        }
                        // setShowCreateTask(true);
                        runMoralisFunction("addTask", {
                          boardId: bid as string,
                          columnId: id,
                          title: "",
                          value: 0,
                        }).then((res: any) => {
                          console.log(res);
                          setSpace(res.space as BoardData);
                          setTaskId(res.taskId);
                          setIsTaskOpen(true);
                          // setShowCreateTask(false);
                        });
                      }}
                      disabled={space.roles[user?.id as string] !== 3}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      sx={{ mb: 0.5, p: 1 }}
                      size="small"
                      onClick={() => setIsOpen(true)}
                      disabled={space.roles[user?.id as string] !== 3}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </TaskTitleContainer>
                  <Box sx={{ display: "flex", flexDirection: "row" }}>
                    {/* <Button
                        sx={{
                          textTransform: "none",
                          textAlign: "left",
                          justifyContent: "flex-start",
                          mr: 1,
                          color: palette.text.primary,
                        }}
                        startIcon={<GitHubIcon />}
                        onClick={() => {
                          if (
                            !column.createCard[space.roles[user?.id as string]]
                          ) {
                            notify(
                              "Your role doesn't have permission to create tasks in this column",
                              "error"
                            );
                            return;
                          }
                          setShowCreateGithubTask(true);
                        }}
                        fullWidth
                        size="small"
                        variant="contained"
                        disableElevation
                      >
                        Import Card
                      </Button> */}
                  </Box>
                  <TaskList>
                    {tasks?.map((task, index) => {
                      if (task)
                        return (
                          <TaskContainer
                            key={task?.taskId}
                            task={task}
                            index={index}
                            column={column}
                          />
                        );
                    })}
                    {provided.placeholder}
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
    </OuterContainer>
  );
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
      : "0.5px solid transparent"};
  // &:hover {
  //   border: 0.1px solid ${(props) => props.palette.secondary.dark};
  // }
  min-width: 16rem;
  transition: 0.5s ease-in-out;
`;

export default Column;
