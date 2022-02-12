import { Button, InputBase } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { BoardData, useBoard } from ".";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { CreateTaskContainer } from "./createTask";
import { addTask } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { Octokit } from "@octokit/rest";

type Props = {
  setShowCreateTask: (showCreateTask: boolean) => void;
  columnId: string;
};

const CreateGithubTask = ({ setShowCreateTask, columnId }: Props) => {
  const [newIssueLink, setNewIssueLink] = useState("");
  const [newTaskReward, setNewTaskReward] = useState(
    undefined as unknown as number
  );
  const { data, setData } = useBoard();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const { bid } = router.query;
  const octokit = new Octokit();
  return (
    <CreateTaskContainer>
      <InputBase
        placeholder="Issue Link"
        sx={{
          fontSize: "14px",
          marginLeft: "6px",
        }}
        value={newIssueLink}
        onChange={(e) => setNewIssueLink(e.target.value)}
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
            const splitValues = newIssueLink.split("/");
            octokit.rest.issues
              .get({
                owner: splitValues[3],
                repo: splitValues[4],
                issue_number: parseInt(splitValues[6]),
              })
              .then(({ data }) => {
                console.log(data);
                addTask(
                  Moralis,
                  bid as string,
                  columnId,
                  data.title,
                  newTaskReward,
                  data.body as string
                ).then((res: any) => setData(res as BoardData));
                setNewTaskReward(0);
                setNewIssueLink("");
                setShowCreateTask(false);
              });
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
