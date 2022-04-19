import CircleIcon from '@mui/icons-material/Circle';
import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { useMoralisFunction } from '../../../../hooks/useMoralisFunction';
import { Block, Task } from '../../../../types';
import { uid } from '../../../../utils/utils';
import { PrimaryButton } from '../../../elements/styledComponents';
import Editor from '../../editor';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneIcon from '@mui/icons-material/Done';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { notify } from '../../settingsTab';
import { useAccess } from '../../../../hooks/useAccess';
import { useCardStatus } from '../../../../hooks/useCardStatus';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Submission = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const { isCardSteward, isCardAssignee } = useAccess(task);
  const { isAssigned, isInReview, isInRevision, isClosed, isPaid } =
    useCardStatus(task);
  const [feedback, setFeedback] = useState('');

  const syncBlocksToMoralis = (blocks: Block[]) => {
    // console.log({ blocks });
    setFeedback('Saving draft');
    runMoralisFunction('updateCard', {
      updates: {
        submissions: {
          content: blocks,
        },
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
        setFeedback('Saved draft');
      })
      .catch((err) => {
        setFeedback('Failed to save draft');
        console.log(err);
      });
  };

  const handleAsk = () => {
    runMoralisFunction('updateCard', {
      updates: {
        status: 200,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        setSpace(res.space);
        setTask(res.task);
        notify('Asked for review', 'success');
      })
      .catch((res) => {
        console.log(res);
        notify(`${res.message}`, 'error');
      });
  };

  const handleDone = () => {
    runMoralisFunction('updateCard', {
      updates: {
        status: 205,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
        notify('Closed card', 'success');
      })
      .catch((res) => {
        console.log(res);
        notify('Failed while closing card', 'error');
      });
  };

  const handleRevision = () => {
    runMoralisFunction('updateCard', {
      updates: {
        status: 201,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        setSpace(res.space);
        setTask(res.task);
        notify('Asked for revision', 'success');
      })
      .catch((res) => {
        console.log(res);
        notify('Failed while asking for revision', 'error');
      });
  };

  return (
    <Box sx={{ color: '#eaeaea', height: 'auto', mr: 3 }}>
      {((isCardSteward() &&
        (isInReview() || isInRevision() || isClosed() || isPaid())) ||
        isCardAssignee()) && (
        <Editor
          syncBlocksToMoralis={syncBlocksToMoralis}
          initialBlock={
            task.submissions?.length > 0
              ? task.submissions[0]?.content
              : [
                  {
                    id: uid(),
                    html: '',
                    tag: 'p',
                    type: '',
                    imageUrl: '',
                    embedUrl: '',
                  },
                ]
          }
          placeholderText={`Add submission, press "/" for commands`}
          readonly={
            (isCardSteward() as boolean) ||
            (isClosed() as boolean) ||
            (isPaid() as boolean)
          }
        />
      )}
      {isInRevision() && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            mt: 4,
            alignItems: 'center',
          }}
        >
          <StarHalfIcon
            sx={{ display: 'flex', alignItems: 'center', width: '20px' }}
          />
          <Typography variant="body2" sx={{ ml: 2, alignItems: 'center' }}>
            Submission is in Revision
          </Typography>
        </Box>
      )}
      {
        //Assignee view
        isCardAssignee() && (isInRevision() || isAssigned()) && (
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 4 }}>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleAsk}
              disabled={[200, 300].includes(task.status)}
              startIcon={<VisibilityIcon />}
            >
              Ask for review
            </PrimaryButton>
          </Box>
        )
      }

      {isCardAssignee() && isInReview() && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            mt: 4,
            alignItems: 'center',
          }}
        >
          <VisibilityIcon
            sx={{ display: 'flex', alignItems: 'center', width: '20px' }}
          />
          <Typography variant="body2" sx={{ ml: 2, alignItems: 'center' }}>
            Submission is in Review
          </Typography>
        </Box>
      )}
      {
        //Reviewer view
        isCardSteward() && isInReview() && (
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 4 }}>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleDone}
              startIcon={<DoneIcon />}
            >
              Looks good!
            </PrimaryButton>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleRevision}
              startIcon={<StarHalfIcon />}
            >
              Needs some work
            </PrimaryButton>
          </Box>
        )
      }
      {isCardSteward() && isAssigned() && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 4 }}>
          <Typography variant="body1" sx={{ mr: 4 }}>
            No submissions yet
          </Typography>
        </Box>
      )}
    </Box>
  );
};
export default Submission;
