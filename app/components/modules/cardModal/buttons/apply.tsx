import HailIcon from '@mui/icons-material/Hail';
import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import { Task } from '../../../../types';
import { CardButton } from '../../../elements/styledComponents';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function Apply({ task, setTask }: Props) {
  const { setProposalEditMode, viewableComponents } = useCardDynamism(task);
  const { user } = useMoralis();
  const [buttonText, setButtonText] = useState('Apply');
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

  if (viewableComponents.applyButton) {
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
            {buttonText}
          </Typography>
        </CardButton>
      </Box>
    );
  }

  return <div />;
}

export default Apply;
