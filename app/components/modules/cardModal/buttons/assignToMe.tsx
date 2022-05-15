import HailIcon from '@mui/icons-material/Hail';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useMoralis } from 'react-moralis';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import { CardButton } from '../../../elements/styledComponents';
import useCardUpdate from '../../../../hooks/useCardUpdate';

function AssignToMe() {
  const { user } = useMoralis();
  const { isAssignToMeViewable } = useCardDynamism();
  const { updateStatusAndAssignee } = useCardUpdate();

  if (isAssignToMeViewable()) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mx: 1,
          minWidth: '7rem',
        }}
      >
        <CardButton
          data-testid="bAssignToMeButton"
          variant="outlined"
          onClick={() => {
            if (user) updateStatusAndAssignee(user?.id, 'assignToMe');
          }}
          color="success"
          sx={{
            padding: '1px',
            minWidth: '2rem',
          }}
          startIcon={<HailIcon sx={{ my: 2, ml: 0.5 }} />}
          size="small"
        >
          <Typography
            sx={{
              fontSize: 14,
              mr: 0.5,
            }}
          >
            Assign me
          </Typography>
        </CardButton>
      </Box>
    );
  }
  return <div />;
}

export default AssignToMe;
