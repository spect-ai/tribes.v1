import styled from "@emotion/styled";
import { Button, InputBase } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { useBoard } from ".";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { CreateTaskContainer } from "./createTask";

type Props = {
  setShowCreateTask: (showCreateTask: boolean) => void;
  columnId: string;
};

const CreateGithubTask = ({ setShowCreateTask, columnId }: Props) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskReward, setNewTaskReward] = useState(
    undefined as unknown as number
  );
  const { data, setData } = useBoard();
  return (
    <CreateTaskContainer>
      <InputBase
        placeholder="Issue"
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
        onChange={(e) => setNewTaskReward(parseInt(e.target.value))}
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
                [columnId]: {
                  ...data.columns[columnId],
                  taskIds: [
                    ...data.columns[columnId].taskIds,
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
  );
};

export default CreateGithubTask;
