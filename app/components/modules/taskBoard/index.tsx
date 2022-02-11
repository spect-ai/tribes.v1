import styled from "@emotion/styled";
import React, { createContext, useContext, useEffect, useState } from "react";
import { initialData } from "../../../constants";
import Column from "./column";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { useRouter } from "next/router";
import Link from "next/link";
import { getBoard, updateColumnOrder, addColumn, removeColumn } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";

type Props = {};

export type column = {
  id: string;
  title: string;
  taskIds: string[];
};

export type task = {
  id: string;
  title: string;
  reward: number;
  deadline: string;
};

interface BoardData {
  id: string;
  name: string;
  tasks: {
    [key: string]: task;
  };
  columns: {
    [key: string]: column;
  };
  columnOrder: string[];
}

interface BoardContextType {
  data: BoardData;
  setData: (data: BoardData) => void;
}

const BoardContext = createContext<BoardContextType>({} as BoardContextType);

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
  max-height: 80vh;
  overflow-x: auto;
  overflow-y: hidden;
`;

const TaskBoard = (props: Props) => {
  const context = useProviderBoard();
  const router = useRouter();
  const { Moralis } = useMoralis();

  const { id, bid } = router.query;
  const setData = context.setData;
  const data = context.data;
  useEffect(() => {
    getBoard(Moralis, bid as string)
      .then((res: any) => {
        console.log(res);
        context.setData(res);
      })
      .catch((err: any) => alert(err));
  }, []);

  const reorder = (list: string[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    if (type === "column") {
      const newColumnOrder = reorder(data.columnOrder, source.index, destination.index);
      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      updateColumnOrder(Moralis, bid as string, newColumnOrder).then((res: any) => console.log(res));
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      console.log("heyyyo");
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
    } else {
      console.log("yyuyyuy");

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
    }
  };
  return (
    <BoardContext.Provider value={context}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Link href={`/tribe/${id}`} passHref>
          <Button startIcon={<ArrowLeftIcon />} sx={{ textTransform: "none", fontSize: 12, ml: 1 }}>
            Back to tribe
          </Button>
        </Link>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided, snapshot) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {data.columnOrder.map((columnId, index) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
                return <Column key={columnId} column={column} tasks={tasks} id={columnId} index={index} />;
              })}
              {provided.placeholder}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  height: "100%",
                  width: "16rem",
                  minWidth: "16rem",
                  margin: "1rem 2rem 1rem 0rem",
                }}
                style={{
                  backgroundColor: "#00194A",
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
                      },
                    },
                    columnOrder: [...data.columnOrder, `column-${data.columnOrder.length}`],
                  });
                  addColumn(Moralis, bid as string).then((res: any) => console.log(res));
                }}
              >
                Add new column
              </Button>
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </BoardContext.Provider>
  );
};

function useProviderBoard() {
  const [data, setData] = useState<BoardData>(initialData as BoardData);
  return {
    data,
    setData,
  };
}

export const useBoard = () => useContext(BoardContext);

export default TaskBoard;
