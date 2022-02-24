import styled from "@emotion/styled";
import { Autocomplete, Popover, TextField } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskLabels } from "../../../adapters/moralis";
import { labelsMapping } from "../../../constants";
import { BoardData, Task } from "../../../types";
import {
  LabelChipButton,
  PrimaryButton,
} from "../../elements/styledComponents";
import { useBoard } from "../taskBoard";
import { PopoverContainer } from "./datePopover";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  task: Task;
};

const LabelPopover = ({ open, anchorEl, handleClose, task }: Props) => {
  const [labels, setLabels] = useState(task.tags);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { data, setData } = useBoard();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => handleClose("label")}
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
          sx={{ mt: 4 }}
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            updateTaskLabels(Moralis, labels, task.taskId).then(
              (res: BoardData) => {
                console.log(res);
                setData(res);
                setIsLoading(false);
                handleClose("label");
              }
            );
          }}
        >
          Save
        </PrimaryButton>
      </PopoverContainer>
    </Popover>
  );
};

export default LabelPopover;
