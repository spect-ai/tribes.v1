import styled from '@emotion/styled';
import { CreditScore, DateRange, MonetizationOn } from '@mui/icons-material';
import { Avatar, Palette, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { labelsMapping, monthMap } from '../../../constants';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Task } from '../../../types';
import { Chip } from '../task';
import CardModal from '../cardModal';

type Props = {
  task: Task;
};

const TaskItem = styled.div<{
  palette: Palette;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0.5rem 0rem;
  padding: 0.5rem 2rem;
  border-radius: 5px;
  background-color: ${(props) => props.palette.primary.main};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  cursor: pointer;
  width: 95%;
  border: 0.1px solid transparent;
  transition: border 0.5s ease-in-out;
  &:hover {
    border: 0.1px solid rgb(234, 234, 234, 0.3);
  }
`;

const TaskLabelsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 45%;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const AvatarContainer = styled.div`
  width: 5%;
  display: flex;
  justify-content: center;
`;

function TaskListItem({ task }: Props) {
  const { space } = useSpace();
  const { getAvatar } = useProfileInfo();
  const { palette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={task.taskId}
      />
      <TaskItem palette={palette} onClick={() => setIsOpen(true)}>
        <Typography sx={{ width: '50%' }}>{task.title}</Typography>
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
        <AvatarContainer>
          {task.assignee.length > 0 && (
            <Avatar
              alt={space.memberDetails[task.assignee[0]]?.username}
              src={getAvatar(space.memberDetails[task.assignee[0]])}
              sx={{ height: 32, width: 32 }}
            />
          )}
        </AvatarContainer>
      </TaskItem>
    </>
  );
}

export default TaskListItem;
