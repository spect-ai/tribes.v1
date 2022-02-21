import { Grow, IconButton, Modal, Tooltip } from "@mui/material";
import React, { useState } from "react";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { Box } from "@mui/system";

type Props = {};

const CreateEpochModal = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <Tooltip title="Start Epoch">
        <IconButton
          sx={{ mb: 0.5, p: 1.7 }}
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <PlayCircleFilledWhiteIcon />
        </IconButton>
      </Tooltip>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>Create Epoch ser!</Box>
        </Grow>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "50rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

export default CreateEpochModal;
