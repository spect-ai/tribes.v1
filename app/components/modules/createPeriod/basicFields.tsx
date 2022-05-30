import { Box, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

type Props = {
  handleClose: () => void;
  handleNextStep: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  setIsNextDisabled: (isNextDisabled: boolean) => void;
};

function BasicFields({
  handleClose,
  handleNextStep,
  name,
  setName,
  description,
  setDescription,
  setIsNextDisabled,
}: Props) {
  const [nameError, setNameError] = useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', m: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.primary', ml: 2, mb: 1 }}>
        What do you want to call this period? *
      </Typography>{' '}
      <TextField
        data-testid="iEpochName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.length < 1) {
            setNameError(true);
            setIsNextDisabled(true);
          } else {
            setNameError(false);
            setIsNextDisabled(false);
          }
        }}
        placeholder="Gifting for the month of..."
        fullWidth
        sx={{}}
        size="small"
        color="secondary"
        error={nameError}
        required
      />
      {nameError && (
        <Typography variant="body2" sx={{ color: '#f44336', ml: 2 }}>
          Name is required
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ color: 'text.primary', ml: 2, mb: 1, mt: 4 }}
      >
        Add a description for this period
      </Typography>
      <TextField
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="text"
        size="small"
        minRows="5"
        fullWidth
        placeholder="In this period, we will..."
        multiline
        color="secondary"
        maxRows={5}
      />
    </Box>
  );
}

export default BasicFields;
