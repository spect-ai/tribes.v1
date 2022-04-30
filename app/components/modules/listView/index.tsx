import styled from '@emotion/styled';
import { ExpandMore } from '@mui/icons-material';
import { AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import React from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { BoardData } from '../../../types';
import { ListAccordian } from '../../elements/styledComponents';
import { Chip } from '../task';
import TaskListItem from '../taskListItem';

type Props = {
  board: BoardData;
  handleDragEnd: (result: DropResult) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`;

function ListView({ board, handleDragEnd }: Props) {
  return (
    <Container>
      {board.columnOrder.map((columnId) => {
        const column = board.columns[columnId];
        let tasks = column.taskIds?.map((taskId) => board.tasks[taskId]);
        tasks = tasks.filter((element) => {
          return element !== undefined;
        });
        return (
          <ListAccordian disableGutters key={columnId} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography sx={{ width: '10%' }}>{column.title}</Typography>
              <Chip color="rgb(153, 204, 255, 0.2)">{tasks?.length}</Chip>
            </AccordionSummary>
            <AccordionDetails>
              {tasks?.map((task) => (
                <TaskListItem key={task.taskId} task={task} />
              ))}
            </AccordionDetails>
          </ListAccordian>
        );
      })}
    </Container>
  );
}

export default ListView;
