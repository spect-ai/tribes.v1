import HailIcon from '@mui/icons-material/Hail';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useMoralis } from 'react-moralis';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import { CardButton } from '../../../elements/styledComponents';
import useCardUpdate from '../../../../hooks/useCardUpdate';

function AssignToMe() {
  const { user } = useMoralis();
  const { viewableComponents } = useCardDynamism();
  const { updateStatusAndAssignee } = useCardUpdate();

  if (viewableComponents.assignToMe) {
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
          data-testid="bAssignToMeButton"
          variant="outlined"
          onClick={() => {
            if (user) updateStatusAndAssignee(user?.id, 'assignToMe');
          }}
          color="secondary"
          sx={{
            padding: '2px',
            minWidth: '3rem',
          }}
          startIcon={<HailIcon sx={{ my: 2, ml: 2 }} />}
          size="small"
        >
          <Typography
            sx={{
              fontSize: 14,
              mr: 2,
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