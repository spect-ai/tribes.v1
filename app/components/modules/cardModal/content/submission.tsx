import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Typography,
  Modal,
  Grow,
  IconButton,
  styled as MUIStyled,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneIcon from '@mui/icons-material/Done';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { uid } from '../../../../utils/utils';
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
} from '../../../elements/styledComponents';
import Editor from '../../editor';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useAccess from '../../../../hooks/useAccess';
import useCardStatus from '../../../../hooks/useCardStatus';
import { useCardContext } from '..';
import { Block } from '../../../../types';
import { notify } from '../../settingsTab';

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '20%',
  left: '35%',
  transform: 'translate(-50%, -50%)',
  width: '30rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const ModalContent = MUIStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

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
  const {
    updateSubmission,
    updateStatus,
    updateToDone,
    updateRevisionInstruction,
  } = useCardUpdate();
  const [openRevisionModal, setOpenRevisionModal] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleRevisionModalClose = () => {
    setOpenRevisionModal(false);
  };
  const handleSubmissionSave = (content: Block[]) => {
    if (task.submissions?.length > 0) {
      updateSubmission(content, task.submissions[0]?.id);
    } else {
      updateSubmission(content, null);
    }
  };

  const handleRevisionSave = () => {
    if (task.submissions?.length === 0 || !task.submissions[0]?.id)
      notify('Submission not found', 'error');

    updateRevisionInstruction(task.submissions[0]?.id, revisionInstructions);
  };

  return (
    <Box sx={{ color: '#eaeaea', height: 'auto', mr: 3, width: '100%' }}>
      {((isCardSteward() &&
        (isInReview() || isInRevision() || isClosed() || isPaid())) ||
        isCardAssignee()) && (
        <Editor
          syncBlocksToMoralis={handleSubmissionSave}
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
            (!isCardAssignee() as boolean) ||
            (isClosed() as boolean) ||
            (isPaid() as boolean)
          }
          id="task-submission"
        />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end',
          alignItems: 'end',
          mt: 8,
        }}
      >
        {isInRevision() && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              mr: 4,
            }}
          >
            <StarHalfIcon
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '20px',
              }}
            />
            <Typography
              variant="body2"
              sx={{ ml: 2, flexDirection: 'row', alignItems: 'center' }}
            >
              Submission is in Revision
            </Typography>
          </Box>
        )}
        {isCardSteward() && isInRevision() && (
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
            onClick={() => {
              // updateStatus(statusToCode.inRevision)
              setOpenRevisionModal(true);
            }}
            startIcon={<StarHalfIcon />}
          >
            Edit revision instructions
          </PrimaryButton>
        )}
        {
          // Assignee view
          isCardAssignee() && isInRevision() && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'end',
              }}
            >
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
                onClick={() => setOpenRevisionModal(true)}
                disabled={isInReview() || isPaid() || isClosed()}
                startIcon={<VisibilityIcon />}
              >
                View revision instructions
              </PrimaryButton>
            </Box>
          )
        }
        {
          // Assignee view
          isCardAssignee() && (isInRevision() || isAssigned()) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'end',
              }}
            >
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
              justifyContent: 'end',
              alignItems: 'end',
            }}
          >
            <VisibilityIcon
              sx={{ display: 'flex', alignItems: 'center', width: '20px' }}
            />
            <Typography variant="body2" sx={{ mx: 4, alignItems: 'center' }}>
              Submission is in Review
            </Typography>
          </Box>
        )}
        {
          // Reviewer view
          isCardSteward() && isInReview() && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'end',
                mt: 4,
              }}
            >
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
                onClick={() => {
                  updateStatus(statusToCode.closed);
                }}
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
                onClick={() => {
                  // updateStatus(statusToCode.inRevision)
                  setOpenRevisionModal(true);
                }}
                startIcon={<StarHalfIcon />}
              >
                Needs some work
              </PrimaryButton>
            </Box>
          )
        }
      </Box>
      {isCardSteward() &&
        !isCardAssignee() &&
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
      <Modal
        open={openRevisionModal}
        onClose={handleRevisionModalClose}
        closeAfterTransition
      >
        <Grow in={openRevisionModal} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography>Revision Instructions</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton
                sx={{ m: 0, p: 0.5 }}
                onClick={handleRevisionModalClose}
              >
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <TextField
                sx={{ border: 0, mt: 2 }}
                id="standard-multiline-static"
                placeholder="Thanks for the submission. Here's how you can update it ..."
                multiline
                fullWidth
                rows={4}
                variant="standard"
                onChange={(event) => {
                  setRevisionInstructions(event.target.value);
                }}
                defaultValue={
                  task.submissions?.length > 0
                    ? task.submissions[0]?.revisionInstruction
                    : ''
                }
                InputProps={{
                  disableUnderline: true, // <== added this
                }}
                disabled={!isCardSteward()}
              />
              {isCardSteward() && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <PrimaryButton
                    variant="outlined"
                    color="secondary"
                    sx={{ width: '7rem', mt: 2, mr: 4, borderRadius: 1 }}
                    loading={isLoading}
                    onClick={() => {
                      handleRevisionSave();
                      handleRevisionModalClose();
                    }}
                  >
                    Save
                  </PrimaryButton>
                </Box>
              )}
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </Box>
  );
}
export default Submission;
