import styled from '@emotion/styled';
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { BoardData } from '../../../types';
import ColumnListSection from './columnListSection';

type Props = {
  handleDragEnd: (result: DropResult) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 0px) {
    padding: 0.1rem;
  }
  @media only screen and (min-width: 768px) {
    padding: 0.5rem;
  }
`;

function ListView({ handleDragEnd }: Props) {
  const { space, filteredTasks } = useSpace();
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container data-testid="listViewContainer">
        {space.columnOrder.map((columnId) => {
          const column = space.columns[columnId];
          let tasks = column.taskIds?.map((taskId) => filteredTasks[taskId]);
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
