import {
  Box,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { Task } from '../../../../types';
import { PrimaryButton } from '../../../elements/styledComponents';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';

function ProposalsStewardView() {
  const { space, setSpace } = useSpace();
  const { task, loading } = useCardContext();
  const { updateStatusAndAssignee } = useCardUpdate();

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
      {task.proposals?.length === 0 && (
        <Typography sx={{ mt: 4 }}>No applications yet</Typography>
      )}
      {task.proposals?.map((proposal, index) => (
        <Box sx={{}} key={proposal.id}>
          {!loading && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                mt: 4,
              }}
            >
              <Avatar
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
                src={space.memberDetails[proposal.userId]?.profilePicture?._url}
              />
              <Typography
                variant="body1"
                sx={{
                  ml: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {space.memberDetails[proposal.userId]?.username}
              </Typography>{' '}
            </Box>
          )}

          <TextField
            sx={{ border: 'none', mt: 2 }}
            id="standard-multiline-static"
            placeholder="I would like to..."
            multiline
            fullWidth
            rows={4}
            variant="standard"
            defaultValue={proposal.content}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <PrimaryButton
                    variant="outlined"
                    sx={{
                      mb: 4,
                      borderRadius: 1,
                      width: '2rem',
                      height: '2rem',
                    }}
                    color="secondary"
                    size="small"
                    loading={loading}
                    onClick={() => {
                      updateStatusAndAssignee(proposal.userId, 'proposalPick');
                    }}
                    disabled={task.assignee?.includes(proposal.userId)}
                  >
                    {task.assignee?.includes(proposal.userId)
                      ? `Assigned`
                      : `Assign`}
                  </PrimaryButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ))}{' '}
    </Box>
  );
}

export default ProposalsStewardView;
