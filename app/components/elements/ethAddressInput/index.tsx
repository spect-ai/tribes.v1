import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoodIcon from '@mui/icons-material/Mood';
import { Box, TextField, Typography } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Member } from '../../../types';
import { isEthAddress } from '../../../utils/utils';

type Props = {
  index?: number;
  ethAddress: string;
  handleAddressUpdate: Function;
  boxsx?: object;
  textFieldSx?: object;
  typographySx?: object;
};

interface Address {
  address: string;
}
export default function EthAddressInput({
  index,
  ethAddress,
  handleAddressUpdate,
  boxsx,
  textFieldSx,
  typographySx,
}: Props) {
  const { control } = useForm<Address>();

  return (
    <Box
      sx={
        boxsx || {
          display: 'flex',
          flexDirection: 'column',
          width: '20rem',
        }
      }
    >
      <Controller
        name="address"
        control={control}
        rules={{ required: true, min: 0 }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            data-testid="iEpochBudgetValue"
            id="filled-hidden-label-normal"
            sx={textFieldSx || { width: '20rem' }}
            placeholder="Address"
            size="small"
            color="secondary"
            error={!!fieldState.error}
            defaultValue={ethAddress}
            onChange={(e) => handleAddressUpdate(e.target.value, index)}
          />
        )}
      />
      {
        // eslint-disable-next-line no-nested-ternary
        isEthAddress(ethAddress) ? (
          <Typography
            sx={
              typographySx || {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'center',
                color: 'success.main',
                fontSize: '12px',
              }
            }
          >
            <CheckIcon sx={{ mr: 1, fontSize: '18px' }} />
            Valid Ethereum Address
          </Typography>
        ) : ethAddress.endsWith('.eth') ? (
          <Typography
            sx={
              typographySx || {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'end',
                color: 'warning.main',
                fontSize: '12px',
              }
            }
          >
            <MoodIcon sx={{ mr: 1, fontSize: '18px' }} />
            ENS domains coming soon!
          </Typography>
        ) : (
          <Typography
            sx={
              typographySx || {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'end',
                color: 'error.main',
                fontSize: '12px',
              }
            }
          >
            <ClearIcon sx={{ mr: 1, fontSize: '18px' }} />
            Invalid Ethereum Address
          </Typography>
        )
      }
    </Box>
  );
}
