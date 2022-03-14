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
import { notify, notifyError } from "../settingsTab";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

const Board = ({ expanded, handleChange }: Props) => {
  const { data, setData } = useBoard();
  const router = useRouter();
  const { Moralis, user } = useMoralis();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    const task = data.tasks[draggableId];
    if (
      !(
        task.access.assignee ||
        task.access.creator ||
        task.access.reviewer ||
        data.roles[user?.id as string] === "admin"
      )
    ) {
      notify("Sorry! You don't have access to this task", "error");
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
      const tempData = Object.assign({}, data);
      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      updateColumnOrder(Moralis, bid as string, newColumnOrder)
        .then((res: any) => {
          setData(res as BoardData);
        })
        .catch((err: any) => {
          setData(tempData);
          notifyError(
            "Sorry! There was an error while changing the column order."
          );
        });
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newList = reorder(start.taskIds, source.index, destination.index);
      const tempData = Object.assign({}, data);
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
      )
        .then((res: any) => {
          setData(res as BoardData);
        })
        .catch((err: any) => {
          setData(tempData);
          notifyError("Sorry! There was an error while moving tasks.");
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
      const tempData = Object.assign({}, data);
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
      )
        .then((res: any) => {
          setData(res as BoardData);
          if (newFinish.id === "column-3") {
            updateTaskStatus(Moralis, draggableId, 205).then((res: any) => {
              console.log("updateTaskStatus", res);
              setData(res as BoardData);
            });
          }
        })
        .catch((err: any) => {
          setData(tempData);
          notifyError("Sorry! There was an error while moving tasks.");
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
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                height: "5%",
                minWidth: "16rem",
                borderRadius: 1,
                margin: "0.3rem 2rem 1rem 0rem",
              }}
              disabled={data.roles[user?.id as string] !== "admin"}
              onClick={() => {
                const newColumnId = Object.keys(data.columns).length;
                const tempData = Object.assign({}, data);
                setData({
                  ...data,
                  columns: {
                    ...data.columns,
                    [`column-${newColumnId}`]: {
                      id: `column-${newColumnId}`,
                      title: "",
                      taskIds: [],
                      status: "",
                      color: "",
                    },
                  },
                  columnOrder: [...data.columnOrder, `column-${newColumnId}`],
                });
                addColumn(Moralis, bid as string)
                  .then((res: BoardData) => setData(res))
                  .catch((err: any) => {
                    setData(tempData);
                    notifyError(
                      "Sorry! There was an error while adding column"
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
};
const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
  height: 88vh;
  max-width: calc(100vw - 9rem);
  overflow-x: auto;
  overflow-y: hidden;
`;

export default Board;
