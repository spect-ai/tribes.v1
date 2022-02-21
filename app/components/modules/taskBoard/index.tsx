import React, { createContext, useContext, useEffect, useState } from "react";
import Column from "./column";
import { Fade } from "@mui/material";
import { useRouter } from "next/router";
import { getBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import Heading from "./heading";
import SkeletonLoader from "./skeletonLoader";
import { BoardData, Task } from "../../../types";
import Board from "./board";
import EpochList from "../epoch";
import Analytics from "../analytics";

type Props = {};

interface BoardContextType {
  data: BoardData;
  setData: (data: BoardData) => void;
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
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

  const tab = context.tab;

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
          {tab === 0 && (
            <Board
              expanded={panelExpanded === "board"}
              handleChange={handleChange}
            />
          )}
          {tab === 1 && (
            <EpochList
              expanded={panelExpanded === "epoch"}
              handleChange={handleChange}
            />
          )}
          {tab === 3 && <Analytics />}
        </BoardContext.Provider>
      </div>
    </Fade>
  );
};

function useProviderBoard() {
  const [data, setData] = useState<BoardData>({} as BoardData);
  const [tab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return {
    data,
    setData,
    tab,
    handleTabChange,
  };
}

export const useBoard = () => useContext(BoardContext);

export default TaskBoard;
