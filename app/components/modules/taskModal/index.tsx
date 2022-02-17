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
import { Column } from "../taskBoard";
import EditTask from "./editTask";
import SkeletonLoader from "./skeletonLoader";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  taskId: string;
  column: Column;
};

const TaskModal = ({ isOpen, handleClose, taskId, column }: Props) => {
  const [loaderText, setLoaderText] = useState("Updating metadata");
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task>({} as Task);
  const { Moralis } = useMoralis();
  const [submissionPR, setSubmissionPR] = useState<any>();

  useEffect(() => {
    setLoading(true);
    getTask(Moralis, taskId)
      .then((task: Task) => {
        console.log(task);
        setTask(task);
        const octokit = new Octokit();
        setLoading(false);
        // if (task.issueLink) {
        //   const splitValues = task.issueLink?.split("/");
        //   console.log(splitValues);
        //   octokit.rest.pulls
        //     .list({
        //       owner: splitValues[3],
        //       repo: splitValues[4],
        //       head: `${splitValues[3]}:${task.taskId}`,
        //     })
        //     .then(({ data }) => {
        //       console.log(data);
        //       if (data && data.length) {
        //         setSubmissionPR(data[0]);
        //       }
        //       setLoading(false);
        //     })
        //     .catch((err) => {
        //       console.log(err);
        //       setLoading(false);
        //     });
        // } else {
        //   setLoading(false);
        // }
      })
      .catch((err: any) => alert(err));
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
