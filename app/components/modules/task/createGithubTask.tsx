import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { Box, Button, InputBase, useTheme } from '@mui/material';
import { Octokit } from '@octokit/rest';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { addTask } from '../../../adapters/moralis';
import { BoardData } from '../../../types';
import { notify } from '../settingsTab';
import { CreateTaskContainer } from './createTask';

type Props = {
  setShowCreateTask: (showCreateTask: boolean) => void;
  columnId: string;
};

function CreateGithubTask({ setShowCreateTask, columnId }: Props) {
  const [newIssueLink, setNewIssueLink] = useState('');
  const [newTaskValue, setNewTaskValue] = useState(
    undefined as unknown as number
  );
  const { space, setSpace } = useSpace();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const { bid } = router.query;
  const octokit = new Octokit();
  const { palette } = useTheme();
  return (
    <CreateTaskContainer palette={palette}>
      <InputBase
        placeholder="Issue Link"
        sx={{
          fontSize: '14px',
          marginLeft: '6px',
        }}
        value={newIssueLink}
        onChange={(e) => setNewIssueLink(e.target.value)}
      />
      <InputBase
        placeholder="Reward"
        sx={{
          fontSize: '14px',
          marginLeft: '6px',
        }}
        value={newTaskValue}
        onChange={(e) => setNewTaskValue(parseInt(e.target.value, 10))}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<DoneIcon />}
          color="secondary"
          onClick={() => {
            const splitValues = newIssueLink.split('/');
            octokit.rest.issues
              .get({
                owner: splitValues[3],
                repo: splitValues[4],
                issue_number: parseInt(splitValues[6], 10),
              })
              .then(({ data }) => {
                addTask(
                  Moralis,
                  bid as string,
                  columnId,
                  data.title,
                  newTaskValue,
                  data.body as string,
                  newIssueLink
                ).then((res: any) => setSpace(res as BoardData));
                setNewTaskValue(0);
                setNewIssueLink('');
                setShowCreateTask(false);
              })
              .catch((err) =>
                notify('Issue not found. Make sure the repo is public', 'error')
              );
          }}
          sx={{ textTransform: 'none' }}
          fullWidth
        >
          Done
        </Button>
        <Button
          startIcon={<CloseIcon />}
          onClick={() => setShowCreateTask(false)}
          sx={{ textTransform: 'none' }}
          color="error"
          fullWidth
        >
          Cancel
        </Button>
      </Box>
    </CreateTaskContainer>
  );
}

export default CreateGithubTask;
