import { Box, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactMde from "react-mde";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { notify } from "../settingsTab";
import * as Showdown from "showdown";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Proposals = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const [proposalOnEdit, setProposalOnEdit] = useState("");

  const handleSave = () => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.proposals = [
      {
        id: "",
        description: proposalOnEdit as string,
        userId: user?.id as string,
      },
    ];
    setTask(temp);
    runMoralisFunction("updateCard", {
      updates: {
        proposal: {
          description: proposalOnEdit,
        },
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        notify("Applied to bounty!", "success");
        setSpace(res);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, "error");
      });
  };

  return (
    <Box
      sx={{
        color: "#eaeaea",
        height: "auto",
        mr: 3,
        mt: 3,
      }}
    >
      {true && (
        <>
          <TextField
            sx={{ border: "none" }}
            id="outlined-textarea"
            placeholder="I would like to..."
            multiline
            fullWidth
            variant="outlined"
            rows={4}
            onChange={(event) => {
              setProposalOnEdit(event.target.value);
            }}
          />
          <PrimaryButton
            variant="outlined"
            sx={{ mt: 4, borderRadius: 1 }}
            color="secondary"
            size="small"
            loading={isLoading}
            onClick={handleSave}
          >
            Apply
          </PrimaryButton>
        </>
      )}
      {task.proposals?.map((proposal, index) => (
        <Typography key={index} variant="body1" sx={{ color: "primary" }}>
          {proposal.description}
        </Typography>
      ))}
    </Box>
  );
};

export default Proposals;
