import { Box, TextField, Typography, Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Proposal, Task } from '../../../../types';
import { PrimaryButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';
import { uid, formatTimeCreated } from '../../../../utils/utils';
import useProfileInfo from '../../../../hooks/useProfileInfo';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';

function ProposalApplicantView() {
  const { user } = useMoralis();
  const { avatar } = useProfileInfo();
  const {
    task,
    setTask,
    setProposalEditMode,
    proposalEditMode,
    setProposalOnEdit,
    proposalOnEdit,
    loading,
  } = useCardContext();

  const { updateProposal } = useCardUpdate();

  return (
    <Box
      sx={{
        color: '#eaeaea',
        height: 'auto',
        mr: 3,
        mt: 3,
        ml: 3,
        width: '45rem',
      }}
    >
      <Box sx={{}}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            mt: 4,
          }}
        >
          <Avatar sx={{ p: 0, m: 0, width: 32, height: 32 }} src={avatar} />
          <Typography
            variant="body1"
            sx={{
              ml: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {user?.get('username')}
          </Typography>{' '}
          {task.proposals[0]?.createdAt && (
            <Typography
              variant="body2"
              sx={{
                ml: 4,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              {formatTimeCreated(task.proposals[0]?.createdAt)} ago
            </Typography>
          )}
          {task.proposals[0]?.edited && task.proposals[0]?.updatedAt && (
            <Typography
              variant="body2"
              sx={{
                ml: 4,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              Edited {formatTimeCreated(task.proposals[0]?.updatedAt)} ago
            </Typography>
          )}
        </Box>
        <TextField
          sx={{ border: 0, mt: 2 }}
          id="standard-multiline-static"
          placeholder="I would like to..."
          multiline
          fullWidth
          rows={4}
          variant="standard"
          onChange={(event) => {
            setProposalOnEdit(event.target.value);
          }}
          defaultValue={proposalOnEdit}
          InputProps={{
            readOnly: !proposalEditMode,
            disableUnderline: true, // <== added this
          }}
        />
        {proposalEditMode && task.assignee?.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'end',
              justifyContent: 'end',
              mx: 1,
              minWidth: '7rem',
            }}
          >
            <PrimaryButton
              variant="outlined"
              sx={{
                mb: 2,
                mt: 2,
                width: '7rem',
                height: '2rem',
              }}
              color="secondary"
              size="small"
              loading={loading}
              onClick={() => {
                updateProposal();
              }}
              disabled={
                task.proposals?.length > 0 &&
                proposalOnEdit === task.proposals[0].content
              }
            >
              Apply
            </PrimaryButton>
          </Box>
        )}
        {!proposalEditMode && task.assignee?.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'end',
              justifyContent: 'end',
              mx: 1,
              minWidth: '7rem',
            }}
          >
            <PrimaryButton
              variant="outlined"
              sx={{
                mb: 2,
                mt: 2,
                width: '7rem',
                height: '2rem',
              }}
              color="secondary"
              size="small"
              loading={loading}
              onClick={() => {
                setProposalEditMode(true);
              }}
            >
              Edit
            </PrimaryButton>
          </Box>
        )}
        {task.assignee?.length > 0 &&
          user &&
          task.assignee?.includes(user?.id) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ color: 'success.main' }}>Congrats</Typography>
                <ThumbUpOffAltIcon
                  sx={{
                    color: 'success.main',
                    ml: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              </Box>

              <Typography sx={{ color: 'text.primary' }}>
                Your application was picked. You have been assigned to this
                bounty.
              </Typography>
            </Box>
          )}
      </Box>
    </Box>
  );
}

export default ProposalApplicantView;
