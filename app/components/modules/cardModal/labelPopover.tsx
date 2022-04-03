import styled from "@emotion/styled";
import {
  Autocomplete,
  Popover,
  TextField,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskLabels } from "../../../adapters/moralis";
import { labelsMapping } from "../../../constants";
import { BoardData, Task } from "../../../types";
import { CardButton, PrimaryButton } from "../../elements/styledComponents";
import { PopoverContainer } from "./styles";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { notify } from "../settingsTab";
import LabelIcon from "@mui/icons-material/Label";
import { LabelChip } from "./styles";
import AddCircleIcon from "@mui/icons-material/AddCircle";
type Props = {
  task: Task;
};

const LabelPopover = ({ task }: Props) => {
  const [labels, setLabels] = useState(task.tags);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
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
        <Typography
          sx={{ fontSize: 12, color: "text.secondary", width: "100%" }}
        >
          Labels
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <CardButton
            variant="outlined"
            onClick={handleClick()}
            color="secondary"
            sx={{
              padding: "6px",
              minWidth: "3rem",
            }}
          >
            {task.tags?.map((tag, index) => (
              <LabelChip
                color={labelsMapping[tag as keyof typeof labelsMapping]}
                key={index}
              >
                #{tag}
              </LabelChip>
            ))}

            {task.tags?.length === 0 && (
              <>
                <Avatar
                  variant="rounded"
                  sx={{ p: 0, mr: 2, width: 20, height: 20 }}
                >
                  <LabelIcon
                    sx={{ backgroundColor: "#2e2f59", color: "text.primary" }}
                  />
                </Avatar>
                <Typography
                  sx={{
                    fontSize: 14,
                    maxWidth: "6rem",
                    minWidth: "3rem",
                    minHeight: "1.3rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: "100",
                  }}
                >
                  Add labels
                </Typography>
              </>
            )}
          </CardButton>
        </Box>
      </Box>
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
            options={Object.keys(labelsMapping)} // Get options from members
            multiple
            value={labels}
            onChange={(event, newValue) => {
              setLabels(newValue as string[]);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search Labels"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            color="secondary"
            onClick={() => {
              setIsLoading(true);
              updateTaskLabels(Moralis, labels, task.taskId)
                .then((res: BoardData) => {
                  setSpace(res);
                  setIsLoading(false);
                  handleClose();
                })
                .catch((err: any) => {
                  notify(
                    "Sorry! There was an error while updating task labels.",
                    "error"
                  );
                });
            }}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default LabelPopover;
