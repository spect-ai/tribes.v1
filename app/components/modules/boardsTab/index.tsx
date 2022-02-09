import { Button, Grid, styled } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import CreateBoard from "./createBoard";
import { useRouter } from "next/router";

type Props = {};

const Board = (props: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Container>
      <CreateBoard isOpen={isOpen} handleClose={handleClose} />
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <BoardButton
            variant="contained"
            onClick={() => {
              router.push(`/tribe/11/board/1`, undefined);
            }}
          >
            <ButtonText>Board 1</ButtonText>
          </BoardButton>
        </Grid>
        <Grid item xs={3}>
          <CreateBoardButton variant="outlined" onClick={() => setIsOpen(true)}>
            <ButtonText>Create new board</ButtonText>
            <AddCircleOutlineIcon sx={{ color: "#eaeaea" }} />
          </CreateBoardButton>
        </Grid>
      </Grid>
    </Container>
  );
};

const Container = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  marginTop: 16,
}));

const CreateBoardButton = styled(Button)(({ theme }) => ({
  height: "8rem",
  width: "100%",
  borderRadius: 8,
  padding: 2,
  backgroundColor: "#5a6972",
  textTransform: "none",
  display: "flex",
  flexDirection: "column",
}));

const BoardButton = styled(Button)(({ theme }) => ({
  height: "8rem",
  width: "100%",
  borderRadius: 8,
  padding: 2,
  textTransform: "none",
  display: "flex",
  flexDirection: "column",
}));

const ButtonText = styled("div")(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: "#fff",
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
}));

export default Board;
