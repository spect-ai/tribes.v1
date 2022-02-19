import React, { createContext, useContext, useEffect, useState } from "react";
import Column from "./column";
import { Fade } from "@mui/material";
import { useRouter } from "next/router";
import { getBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import Heading from "./heading";
import SkeletonLoader from "./skeletonLoader";
import { Task } from "../../../types";
import Board from "./board";
import EpochList from "../epoch";

type Props = {};

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
  status: string;
  color: string;
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
  statusList: string[];
}

interface BoardContextType {
  data: BoardData;
  setData: (data: BoardData) => void;
}

const BoardContext = createContext<BoardContextType>({} as BoardContextType);

const TaskBoard = (props: Props) => {
  const context = useProviderBoard();
  const router = useRouter();
  const { Moralis, isInitialized } = useMoralis();
  const [isLoading, setIsLoading] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState<string | false>("board");
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setPanelExpanded(newExpanded ? panel : false);
    };

  const { bid } = router.query;
  useEffect(() => {
    setIsLoading(true);

    if (isInitialized && bid) {
      getBoard(Moralis, bid as string)
        .then((res: any) => {
          console.log(res);
          context.setData(res);
          setIsLoading(false);
        })
        .catch((err: any) => alert(err));
    }
  }, [isInitialized, bid]);

  if (isLoading) {
    return <SkeletonLoader />;
  }
  return (
    <Fade in={!isLoading} timeout={500}>
      <div>
        <BoardContext.Provider value={context}>
          <Heading />
          <EpochList
            expanded={panelExpanded === "epoch"}
            handleChange={handleChange}
          />
          <Board
            expanded={panelExpanded === "board"}
            handleChange={handleChange}
          />
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
