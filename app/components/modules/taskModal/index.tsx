import { Backdrop, Box, CircularProgress, Fade, Modal, Typography } from "@mui/material";
import { Octokit } from "@octokit/rest";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTask } from "../../../adapters/moralis";
import { Task } from "../../../types";
import EditTask from "./editTask";

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
            <Backdrop
              sx={{
                color: "#eaeaea",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={loading}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2, mb: 1, color: "#eaeaea" }}>{loaderText}</Typography>
              </Box>
            </Backdrop>
            {loading ? <div>Loading....</div> : <EditTask task={task} setTask={setTask} handleClose={handleClose} />}
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
