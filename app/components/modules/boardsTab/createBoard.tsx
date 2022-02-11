import { Grow, IconButton, Modal, styled, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { initBoard } from "../../../adapters/moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const CreateBoard = ({ isOpen, handleClose }: Props) => {
  const { tribe } = useTribe();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <Box sx={modalStyle}>
          <Heading>
            <div>Add Board</div>
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
            ></TextField>
            <PrimaryButton
              variant="outlined"
              sx={{ width: "50%", mt: 2 }}
              onClick={() => {
                initBoard(Moralis, name, tribe.teamId)
                  .then((res: any) => {
                    console.log(res);
                    if (res) {
                      router.push(`/tribe/${tribe.teamId}/board/${res.id}`, undefined);
                    }
                  })
                  .catch((err: any) => alert(err));
              }}
            >
              Add
            </PrimaryButton>
          </ModalContent>
        </Box>
      </Grow>
    </Modal>
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

export default CreateBoard;
