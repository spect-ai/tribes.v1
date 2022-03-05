import styled from "@emotion/styled";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useBoard } from ".";
import Column from "./column";
import AddIcon from "@mui/icons-material/Add";
import {
  addColumn,
  updateColumnOrder,
  updateColumnTasks,
  updateTaskStatus,
} from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { reorder } from "../../../utils/utils";
import { BoardData } from "../../../types";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

const Board = ({ expanded, handleChange }: Props) => {
  const { data, setData } = useBoard();
  const router = useRouter();

  const { Moralis, isInitialized } = useMoralis();
  const [isLoading, setIsLoading] = useState(true);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (type === "column") {
      const newColumnOrder = reorder(
        data.columnOrder,
        source.index,
        destination.index
      );
      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      updateColumnOrder(Moralis, bid as string, newColumnOrder).then(
        (res: any) => {
          setData(res as BoardData);
        }
      );
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newList = reorder(start.taskIds, source.index, destination.index);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [result.source.droppableId]: {
            ...data.columns[result.source.droppableId],
            taskIds: newList,
          },
        },
      });
      updateColumnTasks(
        Moralis,
        bid as string,
        result.source.droppableId,
        result.source.droppableId,
        newList,
        newList
      ).then((res: any) => {
        setData(res as BoardData);
      });
    } else {
      const startTaskIds = Array.from(start.taskIds); // copy
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finish.taskIds); // copy
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });

      updateColumnTasks(
        Moralis,
        bid as string,
        newStart.id,
        newFinish.id,
        newStart,
        newFinish
      ).then((res: any) => {
        setData(res as BoardData);
        if (newFinish.id === "column-3") {
          updateTaskStatus(Moralis, draggableId, 205).then((res: any) => {
            console.log("updateTaskStatus", res);
            setData(res as BoardData);
          });
        }
      });
    }
  };

  const { id, bid } = router.query;
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided, snapshot) => (
          <Container {...provided.droppableProps} ref={provided.innerRef}>
            {data.columnOrder.map((columnId, index) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds?.map((taskId) => data.tasks[taskId]);
              return (
                <Column
                  key={columnId}
                  column={column}
                  tasks={tasks}
                  id={columnId}
                  index={index}
                />
              );
            })}
            {provided.placeholder}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                height: "8%",
                minWidth: "16rem",
                borderRadius: "0.5rem",
                margin: "0.3rem 2rem 1rem 0rem",
              }}
              onClick={() => {
                setData({
                  ...data,
                  columns: {
                    ...data.columns,
                    [`column-${data.columnOrder.length}`]: {
                      id: `column-${data.columnOrder.length}`,
                      title: "",
                      taskIds: [],
                      status: "",
                      color: "",
                    },
                  },
                  columnOrder: [
                    ...data.columnOrder,
                    `column-${data.columnOrder.length}`,
                  ],
                });
                addColumn(Moralis, bid as string).then((res: any) =>
                  console.log(res)
                );
              }}
            >
              Add new column
            </Button>
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
  height: 70vh;
  max-width: calc(100vw - 9rem);
  overflow-x: auto;
  overflow-y: hidden;
`;

export default Board;
