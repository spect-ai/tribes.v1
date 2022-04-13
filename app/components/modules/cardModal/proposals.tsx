import {
  Box,
  TextField,
  Typography,
  Grid,
  Avatar,
  InputAdornment,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { notify } from "../settingsTab";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const textFieldMode = {
  0: "hide",
  1: "edit",
  2: "view",
  3: "submit",
};

const Proposals = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const [proposalOnEdit, setProposalOnEdit] = useState("");
  const [editMode, setEditMode] = useState(false);
  const handleSave = () => {
    setIsLoading(true);
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.proposals = [
      {
        id: "",
        content: proposalOnEdit as string,
        userId: user?.id as string,
      },
    ];
    setTask(temp);
    setEditMode(false);
    runMoralisFunction("updateCard", {
      updates: {
        proposals: {
          content: proposalOnEdit,
        },
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        notify("Applied to bounty!", "success");
        setSpace(res.space);
        setTask(res.task);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setTask(prevTask);
        setEditMode(true);
        setIsLoading(false);
        notify(`${err.message}`, "error");
      });
  };

  const handlePick = (proposalId: string, index: number, assignee: string) => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.selectedProposals = [proposalId];
    temp.assignee = [assignee];
    setTask(temp);
    runMoralisFunction("updateCard", {
      updates: {
        selectedProposals: temp.selectedProposals,
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        notify("Selected proposal!", "success");
        setSpace(res.space);
        setTask(res.task);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setTask(prevTask);
        setIsLoading(false);
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
        ml: 3,
        width: "45rem",
      }}
    >
      {task.proposals?.length === 0 && (
        <>
          {!editMode && (
            <>
              <Typography variant="body1" sx={{ mt: 4 }}>
                {`${task.numProposals || 0} applicants applied to this bounty`}
              </Typography>

              {!(task.access.creator || task.access.reviewer) && (
                <PrimaryButton
                  variant="outlined"
                  sx={{
                    mt: 2,
                    borderRadius: 1,
                    width: "2rem",
                    height: "2rem",
                  }}
                  color="secondary"
                  size="small"
                  loading={isLoading}
                  onClick={() => {
                    setEditMode(true);
                  }}
                >
                  Apply
                </PrimaryButton>
              )}
            </>
          )}

          {editMode && (
            <TextField
              sx={{ border: "none", mt: 2 }}
              id="standard-multiline-static"
              placeholder="I would like to..."
              multiline
              fullWidth
              rows={4}
              variant="standard"
              onChange={(event) => {
                setProposalOnEdit(event.target.value);
              }}
              InputProps={{
                readOnly: !editMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <PrimaryButton
                      variant="outlined"
                      sx={{
                        mb: 4,
                        borderRadius: 1,
                        width: "2rem",
                        height: "2rem",
                      }}
                      color="secondary"
                      size="small"
                      loading={isLoading}
                      onClick={handleSave}
                    >
                      Submit
                    </PrimaryButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </>
      )}
      {task.proposals?.map((proposal, index) => (
        <Box sx={{}} key={index}>
          {!isLoading && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                mt: 4,
              }}
            >
              <Avatar
                sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                src={`https://cdn.discordapp.com/avatars/${
                  space.memberDetails[proposal.userId]?.discordId
                }/${space.memberDetails[proposal.userId]?.avatar}.png`}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {space.memberDetails[proposal.userId]?.username}
              </Typography>{" "}
            </Box>
          )}

          <TextField
            sx={{ border: "none", mt: 2 }}
            id="standard-multiline-static"
            placeholder="I would like to..."
            multiline
            fullWidth
            rows={4}
            variant="standard"
            onChange={(event) => {
              setProposalOnEdit(event.target.value);
            }}
            defaultValue={proposal.content}
            InputProps={{
              readOnly: !editMode,
              endAdornment: (
                <InputAdornment position="end">
                  {editMode ? (
                    <PrimaryButton
                      variant="outlined"
                      sx={{
                        mb: 4,
                        borderRadius: 1,
                        width: "2rem",
                        height: "2rem",
                      }}
                      color="secondary"
                      size="small"
                      loading={isLoading}
                      onClick={handleSave}
                    >
                      Submit
                    </PrimaryButton>
                  ) : task.access.creator || task.access.reviewer ? (
                    <PrimaryButton
                      variant="outlined"
                      sx={{
                        mb: 4,
                        borderRadius: 1,
                        width: "2rem",
                        height: "2rem",
                      }}
                      color="secondary"
                      size="small"
                      loading={isLoading}
                      onClick={() => {
                        handlePick(proposal.id, index, proposal.userId);
                      }}
                      disabled={task.selectedProposals?.includes(proposal.id)}
                    >
                      {task.selectedProposals?.includes(proposal.id)
                        ? `Picked`
                        : `Pick`}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      variant="outlined"
                      sx={{
                        mb: 4,
                        borderRadius: 1,
                        width: "2rem",
                        height: "2rem",
                      }}
                      color="secondary"
                      size="small"
                      loading={isLoading}
                      onClick={() => {
                        setEditMode(true);
                      }}
                    >
                      Edit
                    </PrimaryButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ))}{" "}
    </Box>
  );
};

export default Proposals;
