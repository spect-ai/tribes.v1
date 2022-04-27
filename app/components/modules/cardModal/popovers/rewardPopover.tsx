import PaidIcon from '@mui/icons-material/Paid';
import {
  Autocomplete,
  Avatar,
  Box,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCardContext } from '..';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../../context/globalContext';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import { Chain, Registry, Task, Token } from '../../../../types';
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from '../../../../utils/utils';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';

function RewardPopover() {
  const {
    state: { registry },
  } = useGlobal();
  const [open, setOpen] = useState(false);
  const {
    task,
    setTask,
    chain,
    setChain,
    token,
    setToken,
    value,
    setValue,
    loading,
    openPopover,
    closePopover,
    anchorEl,
  } = useCardContext();
  const { updateReward } = useCardUpdate();
  const { getReason, isCardStewardAndUnpaidCardStatus } = useCardDynamism();

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
          onClick={openPopover(setOpen)}
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
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover(setOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {!isCardStewardAndUnpaidCardStatus() && (
          <PopoverContainer>
            <Typography variant="body2">{getReason('reward')}</Typography>
          </PopoverContainer>
        )}
        {isCardStewardAndUnpaidCardStatus() && (
          <PopoverContainer>
            <Autocomplete
              options={getFlattenedNetworks(registry as Registry)}
              getOptionLabel={(option) => option.name}
              disableClearable
              value={chain}
              onChange={(event, newValue) => {
                setChain(newValue as Chain);
                const tokens = getFlattenedCurrencies(
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
                chain?.chainId
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
              loading={loading}
              onClick={() => {
                updateReward(setOpen);
              }}
            >
              Save
            </PrimaryButton>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}

export default RewardPopover;
