import styled from "@emotion/styled";
import { Autocomplete, Popover, TextField } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskReward } from "../../../adapters/moralis";
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

const RewardPopover = ({ open, anchorEl, handleClose, task }: Props) => {
  const [token, setToken] = useState(task.token);
  const [chain, setChain] = useState(task.chain);
  const [value, setValue] = useState(task.value?.toString());
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
          options={["polygon", "ethereum", "avax"]}
          value={chain}
          onChange={(event, newValue) => {
            setChain(newValue as any);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              size="small"
              fullWidth
              sx={{ mb: 4 }}
              placeholder="Network Chain"
            />
          )}
        />
        <TextField
          id="filled-hidden-label-normal"
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
          }}
          size="small"
          fullWidth
          sx={{ mb: 4 }}
          placeholder="Token"
        />
        <TextField
          id="filled-hidden-label-normal"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          size="small"
          fullWidth
          sx={{ mb: 4 }}
          type="number"
          placeholder="Value"
        />
        <PrimaryButton
          variant="outlined"
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            updateTaskReward(
              Moralis,
              chain,
              token,
              parseFloat(value),
              task.taskId
            ).then((res: BoardData) => {
              console.log(res);
              setData(res);
              setIsLoading(false);
              handleClose("reward");
            });
          }}
        >
          Save
        </PrimaryButton>
      </PopoverContainer>
    </Popover>
  );
};

export default RewardPopover;
