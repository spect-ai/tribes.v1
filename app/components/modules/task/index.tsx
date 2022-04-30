import styled from '@emotion/styled';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import DateRangeIcon from '@mui/icons-material/DateRange';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Avatar, Palette, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import {
  labelsMapping,
  monthMap,
  taskStatusBorderMapping,
} from '../../../constants';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Column, Task } from '../../../types';
import { smartTrim } from '../../../utils/utils';
import CardModal from '../cardModal';

type Props = {
  task: Task;
  index: number;
  column: Column;
};
// const LabelsContainer = styled.div`
//   display: flex;
//   flex-direction: row;
//   word-wrap: break-word;
//   margin-bottom: 1px;
// `;

// const LabelColor = styled.div<{ color: string }>`
//   width: 40px;
//   height: 6px;
//   border-radius: 10px;
//   margin-right: 5px;
//   border: 1px solid ${(props) => props.color};
// `;

const ChipContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0.4rem;
`;

export const Chip = styled.div<{ color: string }>`
  padding: 0px 12px;
  height: 18px;
  font-size: 11px;
  border-radius: 5px;
  background-color: ${(props) => props.color};
  color: #eaeaea;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 4px 8px 8px 0px;
  transition: color 2s ease-in-out;
`;

const TaskCard = styled.div<{
  isDragging: boolean;
  palette: Palette;
  borderColor: string;
}>`
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 20rem;
  margin: 5px;
  border: ${(props) =>
    props.isDragging
      ? `0.1px solid ${props.palette.text.secondary}`
      : `0.1px solid ${props.borderColor}`};
  padding: 0px 2px;
  border-radius: 5px;
  background-color: ${(props) => props.palette.primary.dark};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  transition: border 0.3s ease-in-out;
  &:hover {
    border: 0.1px solid #eaeaea;
  }
`;

const Container = styled.div`
  padding: 7px;
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.4rem;
  align-items: center;
`;

const Title = styled.div<{ palette: Palette }>`
  font-size: 14px;
  padding-left: 0.2rem;
  word-wrap: break-word;
  width: 100%;
  color: ${(props) => props.palette.text.primary};
`;
function TaskContainer({ task, index, column }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { space } = useSpace();
  const { palette } = useTheme();
  const { getAvatar } = useProfileInfo();
  return (
    <>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={task.taskId}
        columnId={column.id}
      />
      <Draggable draggableId={task.taskId} index={index}>
        {(provided, snapshot) => (
          <TaskCard
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            onClick={() => {
              setIsOpen(true);
            }}
            palette={palette}
            borderColor={taskStatusBorderMapping[task.status] || 'transparent'}
          >
            <Container>
              <TitleContainer>
                <Title palette={palette}>{task.title}</Title>
                {task.assignee.length > 0 && (
                  <Avatar
                    alt={space.memberDetails[task.assignee[0]]?.username}
                    src={getAvatar(space.memberDetails[task.assignee[0]])}
                    sx={{ height: 32, width: 32 }}
                  />
                )}
              </TitleContainer>
              <ChipContainer>
                {task.value ? (
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    <MonetizationOnIcon sx={{ fontSize: 12 }} />
                    {task.value} {task.token.symbol}
                  </Chip>
                ) : null}
                {task.deadline && (
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    <DateRangeIcon sx={{ fontSize: 12 }} />
                    {task.deadline.getDate()}{' '}
                    {
                      monthMap[
                        task.deadline.getMonth() as keyof typeof monthMap
                      ]
                    }
                  </Chip>
                )}
                {task.status === 300 && (
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    <CreditScoreIcon sx={{ fontSize: 16 }} /> Paid
                  </Chip>
                )}
                {task?.tags?.map((tag) => (
                  <Chip
                    color={labelsMapping[tag as keyof typeof labelsMapping]}
                  >
                    {tag}
                  </Chip>
                ))}
              </ChipContainer>
            </Container>
          </TaskCard>
        )}
      </Draggable>
    </>
  );
}

export default TaskContainer;
