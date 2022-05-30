import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import React from 'react';

type Props = {
  strategy: string;
  setStrategy: (strategy: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurringPeriod: number;
  setRecurringPeriod: (recurringPeriod: number) => void;
};

function AdvancedFields({
  strategy,
  setStrategy,
  duration,
  setDuration,
  isRecurring,
  setIsRecurring,
  recurringPeriod,
  setRecurringPeriod,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mx: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
        What voting strategy do you want to use?
      </Typography>{' '}
      <Autocomplete
        data-testid="aEpochStrategy"
        options={['Normal Voting', 'Quadratic Voting']}
        value={strategy}
        onChange={(event, newValue) => {
          setStrategy(newValue);
        }}
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            id="filled-hidden-label-normal"
            fullWidth
            sx={{ width: '40%' }}
            placeholder="Strategy"
            size="small"
            color="secondary"
          />
        )}
      />
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, mt: 4 }}>
        How many days do you want the retro period to last?
      </Typography>{' '}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField
          id="filled-hidden-label-normal"
          fullWidth
          sx={{ width: '40%' }}
          placeholder="Duration"
          size="small"
          color="secondary"
          value={duration}
          onChange={(event) => {
            setDuration(parseInt(event.target.value, 10));
          }}
          type="number"
        />
      </Box>
    </Box>
  );
}

export default AdvancedFields;
