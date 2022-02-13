import {
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Tooltip,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { initBoard, updateBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { BoardData, useBoard } from "../taskBoard";
import ConfirmModal from "./confirmModal";

type Props = {};

const BoardSettings = (props: Props) => {
  const { data, setData } = useBoard();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const [name, setName] = useState(data.name);
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };
  return (
    <>
      <Tooltip title="Settings">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {isConfirmOpen && (
        <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
      )}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Heading>
              <div>Settings</div>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              <TextField
                placeholder="Board Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                label="Board Name"
              ></TextField>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2, mr: 1 }}
                  onClick={() => {
                    updateBoard(Moralis, data.objectId, name).then(
                      (res: any) => {
                        setData(res as BoardData);
                      }
                    );
                  }}
                >
                  Save
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2 }}
                  color="error"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Delete Board
                </PrimaryButton>
              </Box>
            </ModalContent>
          </Box>
        </Grow>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "35%",
  left: "35%",
  transform: "translate(-50%, -50%)",
  width: "25rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const Heading = styled("div")(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderBottom: "1px solid #99ccff",
  padding: 16,
  paddingLeft: 32,
}));

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default BoardSettings;
