import { Box, Fade, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTask } from "../../../adapters/moralis";
import { Column, Task } from "../../../types";
import { useBoard } from "../taskBoard";
import EditTask from "./editTask";
import SkeletonLoader from "./skeletonLoader";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  taskId: string;
  column: Column;
};

const TaskModal = ({ isOpen, handleClose, taskId, column }: Props) => {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task>({} as Task);
  const { Moralis } = useMoralis();
  const [submissionPR, setSubmissionPR] = useState<any>();
  const { data, setData } = useBoard();

  useEffect(() => {
    setLoading(true);
    getTask(Moralis, taskId)
      .then((task: Task) => {
        setTask(task);
        setLoading(false);
      })
      .catch((err: any) => alert(err));
  }, [data]);

  return (
    <div>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Fade in={isOpen} timeout={500}>
          <Box sx={taskModalStyle}>
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Fade timeout={1000} in={!loading}>
                <div>
                  <EditTask
                    task={task}
                    setTask={setTask}
                    handleClose={handleClose}
                    submissionPR={submissionPR}
                    column={column}
                  />
                </div>
              </Fade>
            )}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

const taskModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

export default TaskModal;
