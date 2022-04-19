import {
  Box,
  TextField,
  Typography,
  Grid,
  Avatar,
  InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { useMoralisFunction } from '../../../../hooks/useMoralisFunction';
import { BoardData, Task } from '../../../../types';
import { PrimaryButton } from '../../../elements/styledComponents';
import { notify } from '../../settingsTab';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const ProposalsStewardView = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const [proposalOnEdit, setProposalOnEdit] = useState('');
  const [editMode, setEditMode] = useState(false);
  console.log(space);
  const handlePick = (proposalId: string, index: number, assignee: string) => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.assignee = [assignee];
    setTask(temp);
    runMoralisFunction('updateCard', {
      updates: {
        status: 105,
        assignee: [assignee],
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        notify('Selected applicant!', 'success');
        setSpace(res.space);
        setTask(res.task);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setTask(prevTask);
        setIsLoading(false);
        notify(`${err.message}`, 'error');
      });
  };

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
        <Typography sx={{ mt: 4 }}>No proposals yet</Typography>
      )}
      {task.proposals?.map((proposal, index) => (
        <Box sx={{}} key={index}>
          {!isLoading && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                mt: 4,
              }}
            >
              <Avatar
                variant="rounded"
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
            onChange={(event) => {
              setProposalOnEdit(event.target.value);
            }}
            defaultValue={proposal.content}
            InputProps={{
              readOnly: !editMode,
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
                    loading={isLoading}
                    onClick={() => {
                      handlePick(proposal.id, index, proposal.userId);
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
};

export default ProposalsStewardView;
