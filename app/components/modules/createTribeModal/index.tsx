import {
  Box,
  Fade,
  IconButton,
  Modal,
  styled,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CreateTribeForm from "./form";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 3,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const CreateTeamButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #99ccff",
  marginTop: "1rem",
  width: "3rem",
  height: "3rem",
  color: theme.palette.text.secondary,
}));

type Props = {};

const CreateTribeModal = (props: Props) => {
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <CreateTeamButton onClick={handleOpen}>
        <AddIcon />
      </CreateTeamButton>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Fade in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Typography variant="h6" color="primary" sx={{ ml: 4 }}>
              Create Tribe
            </Typography>
            <CreateTribeForm setIsOpen={setIsOpen} />
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default CreateTribeModal;
