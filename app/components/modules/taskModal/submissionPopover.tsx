import styled from "@emotion/styled";
import { Popover, TextField } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskSubmission } from "../../../adapters/moralis";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { useBoard } from "../taskBoard";
import { PopoverContainer } from "./datePopover";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  task: Task;
};

const SubmissionPopover = ({ open, anchorEl, handleClose, task }: Props) => {
  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { data, setData } = useBoard();
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => handleClose("submission")}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <PopoverContainer>
        <TextField
          value={link}
          onChange={(event) => setLink(event.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 4 }}
          placeholder="Paste any link"
        />
        <TextField
          value={name}
          onChange={(event) => setName(event.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 4 }}
          placeholder="Link name"
        />
        <PrimaryButton
          variant="outlined"
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            updateTaskSubmission(Moralis, link, name, task.taskId).then(
              (res: BoardData) => {
                setData(res);
                setIsLoading(false);
                handleClose("submission");
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

export default SubmissionPopover;
