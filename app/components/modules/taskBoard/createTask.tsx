import styled from "@emotion/styled";
import { Button, InputBase } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { useBoard } from ".";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  setShowCreateTask: (showCreateTask: boolean) => void;
  columnId: string;
};

export const CreateTaskContainer = styled.div`
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

const CreateTask = ({ setShowCreateTask, columnId }: Props) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskReward, setNewTaskReward] = useState(
    undefined as unknown as number
  );
  const { data, setData } = useBoard();
  return (
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

export default CreateTask;
