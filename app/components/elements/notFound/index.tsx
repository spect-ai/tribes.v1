import { Box, Typography } from '@mui/material';
import React from 'react';

type Props = {
  text: string;
};

function NotFound({ text }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Typography variant="h4" color="text.primary" sx={{ mb: 48 }}>
        {text}
      </Typography>
    </Box>
  );
}

export default NotFound;
