import RateReviewIcon from '@mui/icons-material/RateReview';
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { Epoch } from '../../../types';
import FeedbackModal from './feedbackModal';
import { useSingleRetro } from './retroModal';
import { PrimaryButton } from '../../elements/styledComponents';
import usePeriod from '../../../hooks/usePeriod';

type Props = {};

// eslint-disable-next-line no-empty-pattern
function Choices({}: Props) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const { saveVotesAndFeedback } = usePeriod();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMember, setFeedbackMember] = useState('');
  const {
    handleVotesUpdate,
    choices,
    votesRemaining,
    votesGiven,
    isLoading,
    period,
  } = useSingleRetro();
  const handleClose = () => {
    setFeedbackModalOpen(false);
  };
  const [isInError, setIsInError] = useState(false);

  useEffect(() => {
    if (votesRemaining < 0) {
      setIsInError(true);
    } else {
      setIsInError(false);
    }
  }, [votesRemaining]);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'end',
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            textAlign: 'right',
            fontSize: 16,
            ml: 2,
          }}
        >
          {`${votesRemaining} votes remaining`}
        </Typography>
      </Box>
      <List sx={{ ml: '1rem', mt: '1rem' }}>
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'end',
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                textAlign: 'right',
                fontSize: 14,
                mr: 6,
              }}
            >
              Votes given
            </Typography>
          </Box>
          {choices?.map((choice: any, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={index}>
              {user?.id !== choice && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'start',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          p: 0,
                          mr: 2,
                          width: 30,
                          height: 30,
                        }}
                        src={space.memberDetails[choice]?.profilePicture?._url}
                        alt={space.memberDetails[choice]?.username}
                      />
                      <Typography color="text.primary">
                        {space.memberDetails[choice]?.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'end',
                      alignItems: 'center',
                    }}
                  >
                    <Tooltip title="Give feedback">
                      <IconButton
                        data-testid="bCloseButton"
                        sx={{
                          height: '2.5rem',
                          mr: '1rem',
                        }}
                        onClick={() => {
                          setFeedbackMember(choice);
                          setFeedbackModalOpen(true);
                        }}
                      >
                        <RateReviewIcon
                          sx={{
                            color: 'text.secondary',
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <TextField
                      id="filled-hidden-label-normal"
                      value={votesGiven[choice]}
                      onChange={(event) => {
                        handleVotesUpdate(
                          choice,
                          parseInt(event.target.value, 10)
                        );
                      }}
                      size="small"
                      type="number"
                      sx={{
                        width: '6rem',
                      }}
                      error={isInError}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Box>
                </Box>
              )}
            </ListItem>
          ))}
        </>
      </List>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'end',
          justifyContent: 'end',
        }}
      >
        <PrimaryButton
          data-testid="bBatchPayModalButton"
          loading={isLoading}
          sx={{ borderRadius: '3px', ml: '1rem', mt: '1rem' }}
          onClick={() => {
            saveVotesAndFeedback(votesGiven, null, period.objectId);
          }}
          variant="outlined"
          id="bApprove"
          color="secondary"
          disabled={isInError}
        >
          Save
        </PrimaryButton>
      </Box>
      <FeedbackModal
        feedbackModalOpen={feedbackModalOpen}
        handleClose={handleClose}
        memberId={feedbackMember}
      />
    </>
  );
}

export default Choices;
