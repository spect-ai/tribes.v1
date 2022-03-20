import {
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { deleteBoard } from "../../../adapters/moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { notify } from "../settingsTab";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const ConfirmModal = ({ isOpen, handleClose }: Props) => {
  const { space } = useSpace();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const id = router.query.id as string;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <ModalContent>
              <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
                Are you sure you want to delete {space.name}?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2, mr: 1 }}
                  onClick={handleClose}
                >
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2 }}
                  color="error"
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    deleteBoard(Moralis, space.objectId)
                      .then((res: any) => {
                        handleClose();
                        router.push(`/tribe/${id}`);
                        setIsLoading(false);
                      })
                      .catch((err: any) => {
                        notify(
                          `Sorry! There was an error while deleting board.`,
                          "error"
                        );
                        setIsLoading(false);
                      });
                  }}
                >
                  Delete Space
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

export default ConfirmModal;
