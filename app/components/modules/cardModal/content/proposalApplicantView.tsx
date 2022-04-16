import {
  Box,
  TextField,
  Typography,
  Grid,
  Avatar,
  InputAdornment,
  TextareaAutosize,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Proposal, Task } from "../../../../types";
import { PrimaryButton } from "../../../elements/styledComponents";
import { notify } from "../../settingsTab";
import { uid, formatTimeCreated } from "../../../../utils/utils";
import { useProfileInfo } from "../../../../hooks/useProfileInfo";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const ProposalApplicantView = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const [proposalOnEdit, setProposalOnEdit] = useState("");
  const [proposal, setProposal] = useState({} as Proposal);
  const { proposalEditMode, setProposalEditMode } = useCardDynamism(task);
  const [editMode, setEditMode] = useState(true);
  const { avatar } = useProfileInfo();

  const handleSave = () => {
    setIsLoading(true);
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.proposals = [
      {
        id: "",
        content: proposalOnEdit as string,
        userId: user?.id as string,
        createdAt:
          prevTask.proposals?.length > 0
            ? prevTask.proposals[0].createdAt
            : new Date(),
        updatedAt: new Date(),
        edited: false,
      },
    ];
    setTask(temp);
    setProposalEditMode(false);
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
        setProposalEditMode(true);
        setIsLoading(false);
        notify(`${err.message}`, "error");
      });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  useEffect(() => {
    console.log(task.proposals);
    if (task.proposals.length > 0) {
      setProposal(task.proposals[0]);
      setProposalOnEdit(task.proposals[0].content);
      if (task.proposals[0]?.content === "") setEditMode(true);
      else setEditMode(false);
    }
  }, [task]);

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
      <Box sx={{}}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Avatar
            variant="rounded"
            sx={{ p: 0, m: 0, width: 32, height: 32 }}
            src={avatar}
          />
          <Typography
            variant="body1"
            sx={{
              ml: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            {user?.get("username")}
          </Typography>{" "}
          {proposal?.createdAt && (
            <Typography
              variant="body2"
              sx={{
                ml: 4,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              {formatTimeCreated(proposal?.createdAt)} ago
            </Typography>
          )}
          {proposal?.edited && proposal?.updatedAt && (
            <Typography
              variant="body2"
              sx={{
                ml: 4,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              Edited {formatTimeCreated(proposal?.updatedAt)} ago
            </Typography>
          )}
        </Box>
        <TextField
          sx={{ border: 0, mt: 2 }}
          id="standard-multiline-static"
          placeholder="I would like to..."
          multiline
          fullWidth
          rows={4}
          variant="standard"
          onChange={(event) => {
            setProposalOnEdit(event.target.value);
          }}
          defaultValue={proposalOnEdit}
          InputProps={{
            readOnly: !editMode,
            disableUnderline: true, // <== added this
          }}
        />
        {editMode && (
          <PrimaryButton
            variant="outlined"
            sx={{
              mb: 2,
              mt: 2,
              width: "8rem",
              height: "2rem",
            }}
            color="secondary"
            size="small"
            loading={isLoading}
            onClick={() => {
              handleSave();
            }}
            disabled={
              task.proposals?.length > 0 &&
              proposalOnEdit === task.proposals[0].content
            }
          >
            Apply
          </PrimaryButton>
        )}
        {!editMode && (
          <PrimaryButton
            variant="outlined"
            sx={{
              mb: 2,
              mt: 2,
              width: "8rem",
              height: "2rem",
            }}
            color="secondary"
            size="small"
            loading={isLoading}
            onClick={() => {
              handleEdit();
            }}
          >
            Edit
          </PrimaryButton>
        )}
      </Box>
    </Box>
  );
};

export default ProposalApplicantView;
