import styled from '@emotion/styled';
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { BoardData } from '../../../types';
import ColumnListSection from './columnListSection';

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container data-testid="listViewContainer">
        {board.columnOrder.map((columnId) => {
          const column = board.columns[columnId];
          let tasks = column.taskIds?.map((taskId) => board.tasks[taskId]);
          tasks = tasks.filter((element) => {
            return element !== undefined;
          });
          return (
            <ColumnListSection key={columnId} column={column} tasks={tasks} />
          );
        })}
      </Container>
    </DragDropContext>
  );
}

export default ListView;
