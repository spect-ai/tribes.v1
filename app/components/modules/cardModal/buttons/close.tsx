import PaidIcon from '@mui/icons-material/Paid';
import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import CurtainsClosedIcon from '@mui/icons-material/CurtainsClosed';
import { useGlobal } from '../../../../context/globalContext';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardStatus from '../../../../hooks/useCardStatus';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { CardButton } from '../../../elements/styledComponents';
// eslint-disable-next-line import/prefer-default-export
export const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40rem',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function CloseButton() {
  const { closeButtonView } = useCardDynamism();
  const { updateStatus } = useCardUpdate();
  const { statusToCode } = useCardStatus();

  if (closeButtonView !== 'hide') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mx: 1,
          minWidth: '9rem',
        }}
      >
        <CardButton
          variant="outlined"
          onClick={() => {
            updateStatus(statusToCode.closed);
          }}
          color="success"
          sx={{
            padding: '1px',
            minWidth: '2rem',
          }}
          startIcon={<CurtainsClosedIcon sx={{ my: 2, ml: 0.5 }} />}
          size="small"
        >
          <Typography
            sx={{
              fontSize: 14,
              mr: 0.5,
            }}
          >
            Close
          </Typography>
        </CardButton>
      </Box>
    );
  }

  return <div />;
}

export default CloseButton;
