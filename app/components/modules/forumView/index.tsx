import styled from '@emotion/styled';
import {
  ArrowDropUp,
  CreditScore,
  DateRange,
  MonetizationOn,
  Add,
  AttachMoneyOutlined,
} from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  Palette,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { labelsMapping, monthMap } from '../../../constants';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Task } from '../../../types';
import { PrimaryButton } from '../../elements/styledComponents';
import CardModal from '../cardModal';
import { Chip, OutlinedChip } from '../task';
import useCardUpdate from '../../../hooks/useCardUpdate';
import CreateCard from '../cardModal/createCard';
import { notify } from '../settingsTab';

type Props = {};

type ForumProps = {
  task: Task;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  align-items: center;
`;

const ForumContainer = styled.div<{
  palette: Palette;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.5rem 0rem;
  padding: 1rem 2rem;
  border-radius: 5px;
  background-color: ${(props) => props.palette.primary.main};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  cursor: pointer;
  width: 60%;
  border: 0.1px solid transparent;
  transition: border 0.5s ease-in-out;
  &:hover {
    border: 0.1px solid rgb(234, 234, 234, 0.3);
  }
`;

const VoteContainer = styled.div`
  width: 10%;
`;

const ForumInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
`;
const TaskLabelsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;
const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ForumSettingsContainer = styled.div`
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

function ForumCard({ task }: ForumProps) {
  const { user } = useMoralis();
  const { space } = useSpace();
  const { getAvatar } = useProfileInfo();
  const { palette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { updateVotes } = useCardUpdate();

  return (
    <>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={task.taskId}
      />
      <ForumContainer palette={palette} onClick={() => setIsOpen(true)}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <VoteContainer>
            <PrimaryButton
              data-testid="bVoteButton"
              sx={{ display: 'flex', flexDirection: 'column' }}
              color={
                task.votes?.includes(user?.id as string) ? 'info' : 'primary'
              }
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                if (user) {
                  updateVotes(user.id, task.taskId);
                }
              }}
            >
              <ArrowDropUp />
              <Typography sx={{ fontSize: 12 }} data-testid="tVoteNumber">
                {task.votes?.length || 0}
              </Typography>
            </PrimaryButton>
          </VoteContainer>
          <ForumInfoContainer>
            <Typography color="text.primary">{task.title}</Typography>
            <TaskLabelsContainer>
              {task.type === 'Bounty' && (
                <OutlinedChip color="rgb(153, 204, 255, 0.9)">
                  <AttachMoneyOutlined sx={{ fontSize: 14 }} />
                  {task.type}
                </OutlinedChip>
              )}
              {task.value ? (
                <Chip color="rgb(153, 204, 255, 0.2)">
                  <MonetizationOn sx={{ fontSize: 12 }} />
                  {task.value} {task.token.symbol}
                </Chip>
              ) : null}
              {task.deadline && (
                <Chip color="rgb(153, 204, 255, 0.2)">
                  <DateRange sx={{ fontSize: 12 }} />
                  {task.deadline.getDate()}{' '}
                  {monthMap[task.deadline.getMonth() as keyof typeof monthMap]}
                </Chip>
              )}
              {task.status === 300 && (
                <Chip color="rgb(153, 204, 255, 0.2)">
                  <CreditScore sx={{ fontSize: 16 }} /> Paid
                </Chip>
              )}
              {task?.tags?.map((tag) => (
                <Chip color={labelsMapping[tag as keyof typeof labelsMapping]}>
                  {tag}
                </Chip>
              ))}
            </TaskLabelsContainer>
          </ForumInfoContainer>
          <AvatarContainer>
            {task.creator && (
              <Avatar
                alt={space.memberDetails[task.creator]?.username}
                src={getAvatar(space.memberDetails[task.creator])}
                sx={{ height: 32, width: 32 }}
              />
            )}
          </AvatarContainer>
        </Box>
      </ForumContainer>
    </>
  );
}

function ForumView(props: Props) {
  const [forumTasks, setForumTasks] = useState<Task[]>([]);
  const [col, setCol] = useState('column-0');
  const { user } = useMoralis();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const handleCreateCardClose = () => {
    setShowCreateTask(false);
  };
  const { space } = useSpace();
  function compare(taskA: Task, taskB: Task) {
    if ((taskA.votes?.length || 0) > (taskB.votes?.length || 0)) {
      return -1;
    }
    if ((taskA.votes?.length || 0) < (taskB.votes?.length || 0)) {
      return 1;
    }
    return 0;
  }

  useEffect(() => {
    let tasks = space.columns[col].taskIds?.map(
      (taskId) => space.tasks[taskId]
    );
    tasks = tasks.filter((element) => {
      return element !== undefined;
    });
    setForumTasks(tasks.sort(compare));
  }, [col, space]);

  return (
    <Container>
      <ForumSettingsContainer>
        <Autocomplete
          data-testid="aColumnPicker"
          options={space.columnOrder}
          value={col}
          getOptionLabel={(option) => space.columns[option].title}
          onChange={(event, newValue) => {
            setCol(newValue as any);
          }}
          disableClearable
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              size="small"
              fullWidth
              placeholder="Search types"
              color="secondary"
            />
          )}
        />

        <PrimaryButton
          startIcon={<Add />}
          fullWidth
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 1, ml: 8 }}
          onClick={() => {
            const column = space.columns[col];
            if (
              !column.createCard[space.roles[user?.id as string]] &&
              !column.createCard[0]
            ) {
              notify(
                "Your role doesn't have permission to create cards in this column",
                'error'
              );
              return;
            }
            setShowCreateTask(true);
          }}
        >
          Create Card
        </PrimaryButton>
      </ForumSettingsContainer>
      {forumTasks.map((task) => (
        <ForumCard task={task} key={task.taskId} />
      ))}
      <CreateCard
        isOpen={showCreateTask}
        handleClose={handleCreateCardClose}
        column={space.columns[col]}
      />
    </Container>
  );
}

export default ForumView;
