import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData } from '../../../types';
import ColumnComponent from '../column';
import { notify } from '../settingsTab';

type Props = {
  handleDragEnd: (result: DropResult) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
  height: calc(100vh - 6.5rem);
  max-width: calc(100vw - 7.2rem);
  overflow-x: auto;
  overflow-y: hidden;
`;

function BoardView({ handleDragEnd }: Props) {
  const { setSpace, space, filteredTasks, filteredColumns } = useSpace();
  const { user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const router = useRouter();
  const { bid } = router.query;
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided, snapshot) => (
          <Container {...provided.droppableProps} ref={provided.innerRef}>
            {space.columnOrder.map((columnId, index) => {
              const column = space.columns[columnId];
              let tasks = column.taskIds?.map(
                (taskId) => filteredTasks[taskId]
              );
              tasks = tasks.filter((element) => {
                return element !== undefined;
              });

              if (
                filteredColumns[columnId] !== undefined ||
                Object.keys(filteredColumns).length === 0
              ) {
                return (
                  <ColumnComponent
                    key={columnId}
                    column={column}
                    tasks={tasks}
                    id={columnId}
                    index={index}
                  />
                );
              }

              return false;
            })}
            {provided.placeholder}
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                textTransform: 'none',
                height: '5%',
                minWidth: '22rem',
                borderRadius: 1,
                margin: '0.3rem 2rem 1rem 0rem',
              }}
              disabled={space.roles[user?.id as string] !== 3}
              onClick={() => {
                const newColumnId = Object.keys(space.columns).length;
                const tempData = { ...space };
                setSpace({
                  ...space,
                  columns: {
                    ...space.columns,
                    [`column-${newColumnId}`]: {
                      id: `column-${newColumnId}`,
                      title: '',
                      taskIds: [],
                      cardType: 1,
                      createCard: { 0: false, 1: false, 2: true, 3: true },
                      moveCard: { 0: false, 1: true, 2: true, 3: true },
                    },
                  },
                  columnOrder: [...space.columnOrder, `column-${newColumnId}`],
                });
                runMoralisFunction('addColumn', {
                  boardId: bid,
                })
                  .then((res: BoardData) => setSpace(res))
                  .catch((err: any) => {
                    setSpace(tempData);
                    notify(
                      'Sorry! There was an error while adding column',
                      'error'
                    );
                  });
              }}
            >
              Add new column
            </Button>
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default BoardView;
