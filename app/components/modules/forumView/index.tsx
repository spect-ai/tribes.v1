import styled from '@emotion/styled';
import {
  ArrowDropUp,
  CreditScore,
  DateRange,
  MonetizationOn,
} from '@mui/icons-material';
import { Avatar, Box, Palette, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { labelsMapping, monthMap } from '../../../constants';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Task } from '../../../types';
import { PrimaryButton } from '../../elements/styledComponents';
import CardModal from '../cardModal';
import { Chip } from '../task';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import Editor from '../editor';

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
const EditorContainer = styled.div`
  margin-top: 2px;
  color: #eaeaea;
  font-size: 0.85rem;
`;

function ForumCard({ task }: ForumProps) {
  const { space } = useSpace();
  const { getAvatar } = useProfileInfo();
  const { palette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  console.log({ task });

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
              sx={{ display: 'flex', flexDirection: 'column' }}
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <ArrowDropUp />
              <Typography sx={{ fontSize: 12 }}>{5}</Typography>
            </PrimaryButton>
          </VoteContainer>
          <ForumInfoContainer>
            <Typography color="text.primary">{task.title}</Typography>
            <TaskLabelsContainer>
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
            {task.assignee.length > 0 && (
              <Avatar
                alt={space.memberDetails[task.assignee[0]]?.username}
                src={getAvatar(space.memberDetails[task.assignee[0]])}
                sx={{ height: 32, width: 32 }}
              />
            )}
          </AvatarContainer>
        </Box>
        <EditorContainer>
          <Editor
            syncBlocksToMoralis={() => {}}
            initialBlock={task.description}
            placeholderText="No details provided yet"
            readonly
          />
        </EditorContainer>
      </ForumContainer>
    </>
  );
}

function ForumView(props: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { runMoralisFunction } = useMoralisFunction();
  const { space } = useSpace();
  useEffect(() => {
    runMoralisFunction('getForumViewTasks', {
      spaceId: space.objectId,
      columnId: 'column-0',
    }).then((res) => {
      console.log({ res });
      setTasks(res);
    });
  }, []);

  if (!tasks || tasks.length === 0) {
    return <div>Loading</div>;
  }

  return (
    <Container>
      {tasks.map((task) => (
        <ForumCard task={task} key={task.taskId} />
      ))}
    </Container>
  );
}

export default ForumView;
