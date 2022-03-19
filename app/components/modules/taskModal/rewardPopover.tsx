import styled from "@emotion/styled";
import { Autocomplete, Popover, TextField } from "@mui/material";
import React, { useState, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskReward } from "../../../adapters/moralis";
import { BoardData, Chain, Registry, Task, Token } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { PopoverContainer } from "./datePopover";
import { useGlobal } from "../../../context/globalContext";
import {
  getFlattenedNetworks,
  getFlattenedCurrencies,
} from "../../../utils/utils";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  task: Task;
};

const RewardPopover = ({ open, anchorEl, handleClose, task }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const [token, setToken] = useState(task.token);
  const [chain, setChain] = useState(task.chain);
  const [value, setValue] = useState(task.value?.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { setSpace } = useSpace();
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
          options={getFlattenedNetworks(registry as Registry)}
          getOptionLabel={(option) => option.name}
          disableClearable
          value={chain}
          onChange={(event, newValue) => {
            setChain(newValue as Chain);
            let tokens = getFlattenedCurrencies(
              registry as Registry,
              newValue?.chainId as string
            );
            if (tokens.length > 0) setToken(tokens[0]);
            else setToken({} as Token);
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
        <Autocomplete
          options={getFlattenedCurrencies(registry as Registry, chain.chainId)}
          disableClearable
          getOptionLabel={(option) => option.symbol}
          value={token}
          onChange={(event, newValue) => {
            setToken(newValue as Token);
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
          color="secondary"
          sx={{ borderRadius: 1 }}
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
              setSpace(res);
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
