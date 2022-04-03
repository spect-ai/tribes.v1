import styled from "@emotion/styled";
import {
  Autocomplete,
  Popover,
  TextField,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import React, { useState, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskReward } from "../../../adapters/moralis";
import { BoardData, Chain, Registry, Task, Token } from "../../../types";
import { PrimaryButton, CardButton } from "../../elements/styledComponents";
import { PopoverContainer } from "./styles";
import { useGlobal } from "../../../context/globalContext";
import {
  getFlattenedNetworks,
  getFlattenedCurrencies,
} from "../../../utils/utils";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import PaidIcon from "@mui/icons-material/Paid";

type Props = {
  task: Task;
};

const RewardPopover = ({ task }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const [token, setToken] = useState(task.token);
  const [chain, setChain] = useState(task.chain);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(task.value?.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { setSpace } = useSpace();

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
          Reward
        </Typography>
        <CardButton
          variant="contained"
          onClick={handleClick()}
          sx={{
            backgroundColor: "#2e2f59",
            padding: "6px",
          }}
        >
          <Avatar variant="rounded" sx={{ p: 0, mr: 2, width: 20, height: 20 }}>
            <PaidIcon
              sx={{ backgroundColor: "#2e2f59", color: "text.primary" }}
            />
          </Avatar>
          {task.value && task.value > 0 ? (
            <Typography
              sx={{
                fontSize: 14,
                maxWidth: "6rem",
                minWidth: "3rem",
                minHeight: "1.3rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {`${task.value} ${task.token?.symbol}`}
            </Typography>
          ) : (
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
              {`Set reward`}
            </Typography>
          )}
        </CardButton>
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
            options={getFlattenedCurrencies(
              registry as Registry,
              chain.chainId
            )}
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
                handleClose();
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

export default RewardPopover;
