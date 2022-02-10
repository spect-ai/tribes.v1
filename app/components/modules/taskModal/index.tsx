import {
  Backdrop,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Task } from "../../../types";
import EditTask from "./editTask";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  task: Task;
};

const TaskModal = ({ isOpen, handleClose, task }: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loaderText, setLoaderText] = useState("Updating metadata");
  const [loading, setLoading] = useState(false);

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
                <Typography sx={{ mt: 2, mb: 1, color: "#eaeaea" }}>
                  {loaderText}
                </Typography>
              </Box>
            </Backdrop>
            <EditTask task={task} handleClose={handleClose} />
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
