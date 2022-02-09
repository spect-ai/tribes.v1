import styled from "@emotion/styled";
import { Button, InputBase, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { column, useBoard } from ".";
import Task from "./task";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/system";
import SettingsIcon from "@mui/icons-material/Settings";

type Props = {
  tasks: {
    id: string;
    title: string;
    reward: number;
    deadline: string;
  }[];
  id: string;
  column: column;
  index: number;
};

const Column = ({ tasks, id, column, index }: Props) => {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskReward, setNewTaskReward] = useState(
    undefined as unknown as number
  );
  const [columnTitle, setColumnTitle] = useState(column.title);
  const { data, setData } = useBoard();

  return (
    <OuterContainer>
      <Draggable draggableId={id} index={index}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Droppable droppableId={id} type="task">
              {(provided) => (
                <TaskList
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  isDragging={snapshot.isDragging}
                >
                  <TaskTitleContainer>
                    <InputBase
                      placeholder="Add Title"
                      sx={{
                        fontSize: "14px",
                        marginLeft: "6px",
                      }}
                      value={columnTitle}
                      onChange={(e) => setColumnTitle(e.target.value)}
                    />
                    <Box sx={{ flex: "1 1 auto" }} />
                    <IconButton sx={{ mb: 0.5, p: 0.5 }} size="small">
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </TaskTitleContainer>
                  {tasks.map((task, index) => (
                    <Task
                      key={task.id}
                      title={task.title}
                      id={task.id}
                      index={index}
                      reward={task.reward}
                      deadline={task.deadline}
                    />
                  ))}
                  {provided.placeholder}
                  {showCreateTask && (
                    <CreateTaskContainer>
                      <InputBase
                        placeholder="Name"
                        sx={{
                          fontSize: "14px",
                          marginLeft: "6px",
                        }}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                      <InputBase
                        placeholder="Reward"
                        sx={{
                          fontSize: "14px",
                          marginLeft: "6px",
                        }}
                        value={newTaskReward}
                        onChange={(e) =>
                          setNewTaskReward(parseInt(e.target.value))
                        }
                      />
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Button
                          startIcon={<DoneIcon />}
                          onClick={() => {
                            setData({
                              ...data,
                              tasks: {
                                ...data.tasks,
                                [`task-${Object.keys(data.tasks).length}`]: {
                                  id: `task-${Object.keys(data.tasks).length}`,
                                  title: newTaskTitle,
                                  reward: newTaskReward,
                                  deadline: "",
                                },
                              },
                              columns: {
                                ...data.columns,
                                [id]: {
                                  ...data.columns[id],
                                  taskIds: [
                                    ...data.columns[id].taskIds,
                                    `task-${Object.keys(data.tasks).length}`,
                                  ],
                                },
                              },
                            });
                            setNewTaskReward(0);
                            setNewTaskTitle("");
                            setShowCreateTask(false);
                          }}
                          sx={{ textTransform: "none" }}
                          fullWidth
                        >
                          Done
                        </Button>
                        <Button
                          startIcon={<CloseIcon />}
                          onClick={() => setShowCreateTask(false)}
                          sx={{ textTransform: "none" }}
                          color="error"
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </Box>
                    </CreateTaskContainer>
                  )}

                  <Button
                    sx={{
                      textTransform: "none",
                      color: "inherit",
                      textAlign: "left",
                      mt: 2,
                      justifyContent: "flex-start",
                    }}
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateTask(true)}
                  >
                    Add Task
                  </Button>
                </TaskList>
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
`;

const OuterContainer = styled.div`
  margin: 1rem 2rem 1rem 0rem;
`;

const CreateTaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 16rem;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  background-color: #00194a;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  border: 0.5px solid #3f3f3e;
`;

const TaskList = styled.div<{ isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: 1rem;
  border-radius: 0.5rem;
  border: ${(props) =>
    props.isDragging ? "0.5px solid #0061ff" : "0.5px solid transparent"};
  transition: 0.5s ease-in-out;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  &:hover {
    border: 0.1px solid #3f3f3e;
  }
  max-height: 70vh;
  overflow-y: auto;
  background-color: #00194a;
  min-width: 16rem;
`;

const Container = styled.div`
  display: flex;
`;

export default Column;
