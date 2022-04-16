import PersonIcon from "@mui/icons-material/Person";
import {
  Autocomplete,
  Avatar,
  Box,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Task } from "../../../../types";
import { CardButton, PrimaryButton } from "../../../elements/styledComponents";
import { notify } from "../../settingsTab";
import { PopoverContainer } from "../styles";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";

type Props = {
  type: string;
  task: Task;
  setTask: (task: Task) => void;
};

const CardMemberPopover = ({ type, task, setTask }: Props) => {
  const [member, setMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { editAbleComponents, viewableComponents, getReason } =
    useCardDynamism(task);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents[type]) {
      setOpen(true);
    } else {
      setFeedbackOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };
  const handleSave = () => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    if (type === "reviewer") {
      temp.reviewer = [member];
      setTask(temp);
      handleClose();
      runMoralisFunction("updateCard", {
        updates: {
          reviewer: member ? [member] : [],
          taskId: task.taskId,
        },
      })
        .then((res: any) => {
          console.log(res);
          setSpace(res.space);
          setTask(res.task);
        })
        .catch((err: any) => {
          setTask(prevTask);
          notify(`${err.message}`, "error");
        });
    } else {
      temp.assignee = [member];
      setTask(temp);
      handleClose();
      runMoralisFunction("updateCard", {
        updates: {
          assignee: member ? [member] : [],
          taskId: task.taskId,
          status: member ? 105 : 100,
        },
      })
        .then((res: any) => {
          console.log(res);
          setSpace(res.space);
          setTask(res.task);
        })
        .catch((err: any) => {
          setTask(prevTask);
          notify(`${err.message}`, "error");
        });
    }
  };

  useEffect(() => {
    if (type === "reviewer") {
      setMember(task.reviewer[0]);
    } else {
      setMember(task.assignee[0]);
    }
  }, [task]);

  return (
    <>
      {viewableComponents[type] && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: 2,
            mx: 1,
          }}
        >
          <Typography
            sx={{ fontSize: 12, color: "text.secondary", width: "100%" }}
          >
            {type === "reviewer" ? "Reviewer" : "Assignee"}
          </Typography>
          <CardButton
            variant="outlined"
            onClick={handleClick()}
            color="secondary"
            sx={{
              padding: "6px",
              minWidth: "3rem",
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                p: 0,
                mr: 2,
                width: 20,
                height: 20,
                backgroundColor: "transparent",
              }}
              src={
                type === "reviewer"
                  ? space.memberDetails[task.reviewer[0]]?.profilePicture?._url
                  : space.memberDetails[task.assignee[0]]?.profilePicture?._url
              }
            >
              <PersonIcon sx={{ color: "text.primary" }} />
            </Avatar>
            <Typography
              sx={{
                fontSize: 14,
                minWidth: "3rem",
              }}
            >
              {type === "reviewer"
                ? space.memberDetails[task.reviewer[0]]?.username ||
                  "Add reviewer"
                : space.memberDetails[task.assignee[0]]?.username ||
                  "Unassigned"}
            </Typography>
          </CardButton>
        </Box>
      )}
      <Popover
        open={feedbackOpen}
        anchorEl={anchorEl}
        onClose={() => handleFeedbackClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContainer>
          <Typography variant="body2">{getReason(type)}</Typography>
        </PopoverContainer>
      </Popover>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContainer>
          <Autocomplete
            options={space.members} // Get options from members
            value={member as any}
            getOptionLabel={(option) => space.memberDetails[option]?.username}
            onChange={(event, newValue) => {
              setMember(newValue as string);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search member"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            color="secondary"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            onClick={handleSave}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default CardMemberPopover;
