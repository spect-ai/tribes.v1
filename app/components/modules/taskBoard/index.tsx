import styled from "@emotion/styled";
import React, { createContext, useContext, useEffect, useState } from "react";
import Column from "./column";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import AddIcon from "@mui/icons-material/Add";
import { Button, Fade, Grow } from "@mui/material";
import { useRouter } from "next/router";
import {
  getBoard,
  updateColumnOrder,
  addColumn,
  updateColumnTasks,
} from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import Heading from "./heading";
import SkeletonLoader from "./skeletonLoader";
import { Task } from "../../../types";

type Props = {};

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

export interface BoardData {
  objectId: string;
  name: string;
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
  teamId: number;
  createdAt: string;
  updatedAt: string;
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
  height: 80vh;
  max-width: calc(100vw - 9rem);
  overflow-x: auto;
  overflow-y: hidden;
`;

const TaskBoard = (props: Props) => {
  const context = useProviderBoard();
  const router = useRouter();
  const { Moralis, isInitialized } = useMoralis();
  const [isLoading, setIsLoading] = useState(true);

  const { id, bid } = router.query;
  const setData = context.setData;
  const data = context.data;
  console.log(`data`);
  console.log(data);
  console.log(`data`);

  useEffect(() => {
    setIsLoading(true);

    if (isInitialized && bid) {
      getBoard(Moralis, bid as string)
        .then((res: any) => {
          console.log("sfsfsf");
          console.log(res);
          console.log("sfsfsf");

          context.setData(res);
          setIsLoading(false);
        })
        .catch((err: any) => alert(err));
    }
  }, [isInitialized, bid]);

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
          console.log(res);
          // setData(res as BoardData);
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
        console.log(res);
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
        console.log(res);
        // setData(res as BoardData);
      });
    }
  };
  if (isLoading) {
    return <SkeletonLoader />;
  }
  return (
    <Fade in={!isLoading} timeout={500}>
      <div>
        <BoardContext.Provider value={context}>
          {/* <Link href={`/tribe/${id}`} passHref>
        <Button
          startIcon={<ArrowLeftIcon />}
          sx={{ textTransform: "none", fontSize: 10, ml: 1 }}
          color="inherit"
        >
          Back to tribe
        </Button>
      </Link> */}
          <Heading />
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="all-columns"
              direction="horizontal"
              type="column"
            >
              {(provided, snapshot) => (
                <Container {...provided.droppableProps} ref={provided.innerRef}>
                  {data.columnOrder.map((columnId, index) => {
                    const column = data.columns[columnId];
                    const tasks = column.taskIds?.map(
                      (taskId) => data.tasks[taskId]
                    );
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
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: "none",
                      height: "8%",
                      width: "19rem",
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
        </BoardContext.Provider>
      </div>
    </Fade>
  );
};

function useProviderBoard() {
  const [data, setData] = useState<BoardData>({} as BoardData);
  return {
    data,
    setData,
  };
}

export const useBoard = () => useContext(BoardContext);

export default TaskBoard;
