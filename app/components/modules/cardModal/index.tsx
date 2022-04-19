import { Box, Fade, Modal, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { getTask } from "../../../adapters/moralis";
import { Column, Task } from "../../../types";
import { notify } from "../settingsTab";
import TaskCard from "./taskCard";
import SkeletonLoader from "./skeletonLoader";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  taskId: string;
  columnId?: string;
};

const CardModal = ({ isOpen, handleClose, taskId, columnId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task>({} as Task);
  const { isInitialized } = useMoralis();
  const [submissionPR, setSubmissionPR] = useState<any>();
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();

  useEffect(() => {
    if (isInitialized && isOpen && taskId) {
      setLoading(true);
      runMoralisFunction("getTask", { taskId, columnId })
        .then((task: Task) => {
          console.log(task);
          setTask(task);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          notify(`Sorry! There was an error while getting task`, "error");
        });
    }
  }, [taskId, isInitialized, isOpen]);

  return (
    <div>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Fade in={isOpen} timeout={500}>
          <ModalContainer id="cardModal">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Fade timeout={1000} in={!loading}>
                <div>
                  <TaskCard
                    task={task}
                    setTask={setTask}
                    handleClose={handleClose}
                    submissionPR={submissionPR}
                  />
                </div>
              </Fade>
            )}
          </ModalContainer>
        </Fade>
      </Modal>
    </div>
  );
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "55rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflowY: "auto",
  overflowX: "hidden",
  height: "35rem",
  padding: "1.5rem 3rem",
}));

export default CardModal;
