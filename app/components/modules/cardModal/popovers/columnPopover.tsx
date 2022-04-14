import {
  Autocomplete,
  Box,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Column, Task } from "../../../../types";
import { CardButton, PrimaryButton } from "../../../elements/styledComponents";
import { notify } from "../../settingsTab";
import { PopoverContainer } from "../styles";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
  column: Column;
};

const ColumnPopover = ({ task, setTask, column }: Props) => {
  const [currStatus, setCurrStatus] = useState(column.id);
  const [status, setStatus] = useState(column.id);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { editAbleComponents } = useCardDynamism(task);
  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents["column"]) {
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
    const prevStatus = currStatus;
    setCurrStatus(status);
    runMoralisFunction("updateCard", {
      updates: {
        columnChange: {
          sourceId: column.id,
          destinationId: status,
        },
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((err: any) => {
        setCurrStatus(prevStatus);
        notify(`${err.message}`, "error");
      });
  };
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
            {space.columns[currStatus].title}
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
          <Typography variant="body2">
            Only card reviewer or creator and space steward can change column
          </Typography>
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
            options={space.columnOrder}
            value={status}
            getOptionLabel={(option) => space.columns[option].title}
            onChange={(event, newValue) => {
              setStatus(newValue as any);
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

export default ColumnPopover;
