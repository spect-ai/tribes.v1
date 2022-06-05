import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Modal,
  styled,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { Epoch } from '../../../types';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useSingleRetro } from './retroModal';
import { PrimaryButton } from '../../elements/styledComponents';
import usePeriod from '../../../hooks/usePeriod';

export const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #fff',
  borderRadius: '1rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: theme.palette.background.default,
  padding: '1rem 2rem',
  [theme.breakpoints.down('md')]: {
    top: '50%',
    left: '50%',
    width: '50%',
    height: '46%',
  },
  [theme.breakpoints.up('md')]: {
    top: '50%',
    left: '50%',
    width: '50%',
    height: '46%',
  },
  [theme.breakpoints.up('lg')]: {
    top: '50%',
    left: '50%',
    width: '50%',
    height: '46%',
  },
}));

type Props = {
  feedbackModalOpen: boolean;
  memberId: string;
  handleClose: () => void;
};

function FeedbackModal({ feedbackModalOpen, memberId, handleClose }: Props) {
  const { space } = useSpace();
  const {
    handleFeedbackUpdate,
    feedbackGiven,
    handleVotesUpdate,
    votesGiven,
    votesRemaining,
    period,
  } = useSingleRetro();
  const { saveVotesAndFeedback } = usePeriod();

  const [isInError, setIsInError] = useState(false);

  useEffect(() => {
    if (votesRemaining < 0) {
      setIsInError(true);
    } else {
      setIsInError(false);
    }
  }, [votesRemaining]);

  return (
    <Modal open={feedbackModalOpen} onClose={handleClose}>
      <ModalContainer id="feedbackModal">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '70%',
            mb: 4,
          }}
        >
          {' '}
          <Avatar
            sx={{
              p: 0,
              mr: 2,
              width: 40,
              height: 40,
            }}
            src={space.memberDetails[memberId]?.profilePicture?._url}
            alt={space.memberDetails[memberId]?.username}
          />
          <Typography color="text.primary" sx={{ fontSize: 16 }}>
            {space.memberDetails[memberId]?.username}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
            }}
          >
            <Typography color="text.primary" sx={{ fontSize: 14, mb: 2 }}>
              Votes given
            </Typography>
            <TextField
              id="filled-hidden-label-normal"
              value={votesGiven[memberId]}
              onChange={(event) => {
                handleVotesUpdate(memberId, parseInt(event.target.value, 10));
              }}
              size="small"
              type="number"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '6rem',
                justifyContent: 'end',
              }}
              error={isInError}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                textAlign: 'right',
                fontSize: 16,
                ml: 12,
              }}
            >
              {`${votesRemaining} votes remaining`}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            mt: 6,
          }}
        >
          <Typography color="text.primary" sx={{ fontSize: 14, mb: 2 }}>
            Feedback given
          </Typography>
          <TextField
            sx={{ border: 0 }}
            placeholder="I think..."
            multiline
            fullWidth
            rows={5}
            onChange={(event) => {
              handleFeedbackUpdate(memberId, event.target.value);
            }}
            defaultValue={
              feedbackGiven && memberId in feedbackGiven
                ? feedbackGiven[memberId]
                : ''
            }
            InputProps={{
              disableUnderline: true, // <== added this
            }}
          />
        </Box>
        <Box
          sx={{ display: 'flex', flexDirection: 'row', pt: 2, marginTop: 8 }}
        >
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => handleClose()}
            sx={{ mr: 1, color: '#f45151' }}
            id="bCancel"
          >
            Cancel
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <PrimaryButton
            data-testid="bBatchPayModalButton"
            sx={{ borderRadius: '3px' }}
            onClick={() => {
              saveVotesAndFeedback(votesGiven, feedbackGiven, period.objectId);
              handleClose();
            }}
            variant="outlined"
            id="bApprove"
            color="secondary"
            disabled={isInError}
          >
            Save
          </PrimaryButton>
        </Box>
      </ModalContainer>
    </Modal>
  );
}

export default FeedbackModal;
