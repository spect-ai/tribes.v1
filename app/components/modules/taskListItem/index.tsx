import styled from '@emotion/styled';
import {
  AttachMoneyOutlined,
  CreditScore,
  DateRange,
} from '@mui/icons-material';
import { Avatar, Palette, Typography, useTheme, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { labelsMapping, monthMap } from '../../../constants';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Task } from '../../../types';
import { Chip, OutlinedChip } from '../task';
import CardModal from '../cardModal';

type Props = {
  task: Task;
  index: number;
};

const TaskItem = styled.div<{
  isDragging: boolean;
  palette: Palette;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.palette.primary.main};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  cursor: pointer;
  border: ${(props) =>
    props.isDragging
      ? `0.1px solid ${props.palette.text.secondary}`
      : `0.1px solid transparent`};
  transition: border 0.5s ease-in-out;
  &:hover {
    border: 0.1px solid rgb(234, 234, 234, 0.3);
  }
  @media only screen and (min-width: 0px) {
    margin: 0.5rem 0rem;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    width: 90%;
  }
  @media only screen and (min-width: 768px) {
    margin: 0.5rem 0rem;
    padding: 0.5rem 2rem;
    border-radius: 5px;
    width: 95%;
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
  @media only screen and (min-width: 0px) {
    width: 10%;
  }
  @media only screen and (min-width: 768px) {
    width: 5%;
  }
  display: flex;
  justify-content: center;
`;

function TaskListItem({ task, index }: Props) {
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
      <Draggable draggableId={task.taskId} index={index}>
        {(provided, snapshot) => (
          <TaskItem
            palette={palette}
            onClick={() => setIsOpen(true)}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          >
            <Typography
              sx={{
                width: { xs: '40%', md: '50%' },
              }}
              fontSize={{
                xs: '0.8rem',
                md: '1rem',
              }}
            >
              {task.title}
            </Typography>
            <TaskLabelsContainer>
              {task.type === 'Bounty' && (
                <OutlinedChip color="rgb(153, 204, 255, 0.9)">
                  <AttachMoneyOutlined sx={{ fontSize: 14 }} />
                  {task.type}
                </OutlinedChip>
              )}
              {task.value ? (
                <Chip color="rgb(153, 204, 255, 0.2)">
                  {task.value} {task.token.symbol}
                </Chip>
              ) : null}
              {task.deadline && (
                <Tooltip
                  title={`Card deadline is ${format(
                    utcToZonedTime(
                      new Date(task.deadline),
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    ),
                    'MMM do, hh:mm a'
                  )}`}
                >
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    <DateRange sx={{ fontSize: 12, mr: 1 }} />
                    <Typography sx={{ fontSize: 12 }}>
                      {format(
                        utcToZonedTime(
                          new Date(task.deadline),
                          Intl.DateTimeFormat().resolvedOptions().timeZone
                        ),
                        'MMM do'
                      )}
                    </Typography>
                  </Chip>
                </Tooltip>
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
                  sx={{ height: 28, width: 28 }}
                />
              )}
            </AvatarContainer>
          </TaskItem>
        )}
      </Draggable>
    </>
  );
}

export default TaskListItem;
