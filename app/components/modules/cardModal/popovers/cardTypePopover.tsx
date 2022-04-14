import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Task } from "../../../../types";
import { CardButton, PrimaryButton } from "../../../elements/styledComponents";
import { notify } from "../../settingsTab";
import { PopoverContainer } from "../styles";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const CardTypePopover = ({ task, setTask }: Props) => {
  const [type, setType] = useState(task?.type || "Task");
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const { editAbleComponents, cannotEditReason } = useCardDynamism(task);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents["type"]) {
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
    temp.type = type;
    setTask(temp);
    handleClose();
    runMoralisFunction("updateCard", {
      updates: {
        type: type,
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(`res card type`);
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, "error");
      });
  };

  useEffect(() => {
    task?.type ? setType(task.type) : setType("Task");
  }, [task]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mx: 1,
        }}
      >
        <CardButton
          variant="outlined"
          onClick={handleClick()}
          color="secondary"
          size="small"
          sx={{
            padding: "2px",
            minWidth: "3rem",
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
            }}
          >
            {task.type || "Task"}
          </Typography>
        </CardButton>
      </Box>
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
          <Typography variant="body2">{cannotEditReason["type"]}</Typography>
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
            options={["Task", "Bounty"]} // Get options from members
            value={type as any}
            onChange={(event, newValue) => {
              setType(newValue as string);
            }}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search types"
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

export default CardTypePopover;
