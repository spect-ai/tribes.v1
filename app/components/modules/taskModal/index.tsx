import styled from "@emotion/styled";
import {
  Backdrop,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Typography,
} from "@mui/material";
import { Octokit } from "@octokit/rest";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTask } from "../../../adapters/moralis";
import { Task } from "../../../types";
import EditTask from "./editTask";
import SkeletonLoader from "./skeletonLoader";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  taskId: string;
};

const TaskModal = ({ isOpen, handleClose, taskId }: Props) => {
  const [loaderText, setLoaderText] = useState("Updating metadata");
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task>({} as Task);
  const { Moralis } = useMoralis();

  useEffect(() => {
    setLoading(true);
    getTask(Moralis, taskId).then((task: Task) => {
      console.log(`ggggg`);
      console.log(task);
      setTask(task);
      setLoading(false);
    });
    const octokit = new Octokit();
    octokit.rest.pulls
      .list({
        owner: "spect-ai",
        repo: "app.v3",
        head: "spect-ai:develop",
      })
      .then(({ data }) => console.log(data));
  }, []);

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
