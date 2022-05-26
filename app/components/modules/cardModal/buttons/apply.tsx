import HailIcon from '@mui/icons-material/Hail';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useMoralis } from 'react-moralis';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import { CardButton } from '../../../elements/styledComponents';
import { useCardContext } from '..';

function Apply() {
  const { task, setTask, setProposalEditMode } = useCardContext();
  const { isApplyButtonViewable } = useCardDynamism();
  const { user } = useMoralis();
  const handleClick = () => {
    const temp = { ...task };
    temp.proposals = [
      {
        id: '',
        content: '',
        userId: user?.id as string,
        createdAt: null,
        updatedAt: null,
        edited: false,
      },
    ];
    setTask(temp);
    setProposalEditMode(true);
  };

  if (isApplyButtonViewable()) {
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
          variant="outlined"
          onClick={() => handleClick()}
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
            Apply
          </Typography>
        </CardButton>
      </Box>
    );
  }

  return <div />;
}

export default Apply;
