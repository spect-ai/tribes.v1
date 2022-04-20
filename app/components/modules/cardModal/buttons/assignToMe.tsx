import HailIcon from '@mui/icons-material/Hail';
import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { useCardDynamism } from '../../../../hooks/useCardDynamism';
import useMoralisFunction from '../../../../hooks/useMoralisFunction';
import { Task } from '../../../../types';
import { delay } from '../../../../utils/utils';
import { CardButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function AssignToMe({ task, setTask }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const { space, setSpace } = useSpace();
  const { editAbleComponents, viewableComponents } = useCardDynamism(task);
  const [buttonText, setButtonText] = useState('Assign to me');

  const handleSave = () => {
    setButtonText('Assigning...');
    runMoralisFunction('updateCard', {
      updates: {
        status: 105,
        assignee: user ? [user?.id] : [],
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        setButtonText('Good luck!');
        delay(1500).then(() => {
          setSpace(res.space);
          setTask(res.task);
        });
      })
      .catch((err: any) => {
        notify(`${err.message}`, 'error');
      });
  };

  useEffect(() => {
    setButtonText('Assign to me');
  }, [task]);

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
          variant="outlined"
          onClick={() => handleSave()}
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

export default AssignToMe;
