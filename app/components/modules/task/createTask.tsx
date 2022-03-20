import styled from "@emotion/styled";
import { Button, InputBase, Palette, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { addTask } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { resolve } from "path/win32";
import { BoardData } from "../../../types";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  showCreateTask: boolean;
  setShowCreateTask: (showCreateTask: boolean) => void;
  columnId: string;
};

export const CreateTaskContainer = styled.div<{ palette: Palette }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 15.6rem;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  background-color: ${(props) => props.palette.primary.dark};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  border: 0.5px solid #3f3f3e;
`;

const CreateTask = ({ setShowCreateTask, columnId, showCreateTask }: Props) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskValue, setNewTaskValue] = useState("");
  const { setSpace } = useSpace();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const { bid } = router.query;
  const { palette } = useTheme();
  return (
    <div>
      {showCreateTask && (
        <CreateTaskContainer palette={palette}>
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
            inputProps={{
              type: "number",
            }}
            value={newTaskValue}
            onChange={(e) => setNewTaskValue(e.target.value)}
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
                addTask(
                  Moralis,
                  bid as string,
                  columnId,
                  newTaskTitle,
                  parseFloat(newTaskValue),
                  "",
                  ""
                ).then((res: any) => {
                  if (!res) {
                    alert("Error");
                    return;
                  }
                  setSpace(res as BoardData);
                  setNewTaskValue("");
                  setNewTaskTitle("");
                  setShowCreateTask(false);
                });
              }}
              sx={{ textTransform: "none", color: "#eaeaea" }}
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
              id="taskCancelButton"
            >
              Cancel
            </Button>
          </Box>
        </CreateTaskContainer>
      )}
    </div>
  );
};

export default CreateTask;
