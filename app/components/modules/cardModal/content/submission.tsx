import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneIcon from '@mui/icons-material/Done';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../../hooks/useMoralisFunction';
import { Block, Task } from '../../../../types';
import { uid } from '../../../../utils/utils';
import { PrimaryButton } from '../../../elements/styledComponents';
import Editor from '../../editor';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useAccess from '../../../../hooks/useAccess';
import useCardStatus from '../../../../hooks/useCardStatus';
import { useCardContext } from '..';

function Submission() {
  const { task, loading } = useCardContext();

  const { isCardSteward, isCardAssignee } = useAccess(task);
  const {
    isAssigned,
    isInReview,
    isInRevision,
    isClosed,
    isPaid,
    statusToCode,
  } = useCardStatus();
  const { updateSubmission, updateStatus } = useCardUpdate();

  return (
    <Box sx={{ color: '#eaeaea', height: 'auto', mr: 3 }}>
      {((isCardSteward() &&
        (isInReview() || isInRevision() || isClosed() || isPaid())) ||
        isCardAssignee()) && (
        <Editor
          syncBlocksToMoralis={updateSubmission}
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
        // Assignee view
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
              loading={loading}
              onClick={() => updateStatus(statusToCode.inReview)}
              disabled={isInReview() || isPaid() || isClosed()}
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
        // Reviewer view
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
              loading={loading}
              onClick={() => updateStatus(statusToCode.closed)}
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
              loading={loading}
              onClick={() => updateStatus(statusToCode.inRevision)}
              startIcon={<StarHalfIcon />}
            >
              Needs some work
            </PrimaryButton>
          </Box>
        )
      }
      {isCardSteward() &&
        !isInReview() &&
        !isInRevision() &&
        !isPaid() &&
        !isClosed() && (
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 4 }}>
            <Typography variant="body1" sx={{ mr: 4 }}>
              No submissions yet
            </Typography>
          </Box>
        )}
    </Box>
  );
}
export default Submission;
