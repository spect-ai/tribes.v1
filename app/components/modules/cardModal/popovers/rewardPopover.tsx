import PaidIcon from '@mui/icons-material/Paid';
import {
  Autocomplete,
  Avatar,
  Box,
  Popover,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../../context/globalContext';
import { useMoralisFunction } from '../../../../hooks/useMoralisFunction';
import { useCardDynamism } from '../../../../hooks/useCardDynamism';
import { Chain, Registry, Task, Token } from '../../../../types';
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from '../../../../utils/utils';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';
import { PopoverContainer } from '../styles';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const RewardPopover = ({ task, setTask }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const [token, setToken] = useState(task.token);
  const [chain, setChain] = useState(task.chain);
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [value, setValue] = useState(task.value?.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { editAbleComponents, getReason } = useCardDynamism(task);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents['reward']) {
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
    temp.chain = chain;
    temp.token = token;
    temp.value = parseFloat(value);
    setTask(temp);
    handleClose();
    runMoralisFunction('updateCard', {
      updates: {
        chain: chain,
        token: token,
        value: parseFloat(value),
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, 'error');
      });
  };

  useEffect(() => {
    setChain(task.chain);
    setToken(task.token);
    setValue(task.value?.toString());
  }, [task]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 2,
          mx: 1,
        }}
      >
        <Typography
          sx={{ fontSize: 12, color: 'text.secondary', width: '100%' }}
        >
          Reward
        </Typography>
        <CardButton
          variant="outlined"
          onClick={handleClick()}
          color="secondary"
          sx={{
            padding: '6px',
            minWidth: '3rem',
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              p: 0,
              mr: 2,
              width: 20,
              height: 20,
              backgroundColor: 'transparent',
            }}
          >
            <PaidIcon sx={{ color: 'text.primary' }} />
          </Avatar>
          {task.value && task.value > 0 ? (
            <Typography
              sx={{
                fontSize: 14,
              }}
            >
              {`${task.value} ${task.token?.symbol}`}
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: 14,
              }}
            >
              No reward{' '}
            </Typography>
          )}
        </CardButton>
      </Box>
      <Popover
        open={feedbackOpen}
        anchorEl={anchorEl}
        onClose={() => handleFeedbackClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Typography variant="body2">{getReason('reward')}</Typography>
        </PopoverContainer>
      </Popover>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
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
                color="secondary"
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
                color="secondary"
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
            inputProps={{ min: 0 }}
            color="secondary"
          />
          <PrimaryButton
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 1 }}
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

export default RewardPopover;
