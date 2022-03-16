import { Button, Grid, Skeleton, styled, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState, useEffect } from "react";
import CreateBoard from "./createBoard";
import { useTribe } from "../../../../pages/tribe/[id]";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { BoardData } from "../../../types";

type Props = {};

const Board = (props: Props) => {
  const router = useRouter();
  const { tribe } = useTribe();
  const { user, isAuthenticated } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Container>
      <CreateBoard isOpen={isOpen} handleClose={handleClose} />
      {!tribe?.boards?.length &&
        !(user && tribe.members.includes(user?.id)) && (
          <Typography variant="h6">No spaces created</Typography>
        )}
      <Grid container spacing={2}>
        {tribe?.boards?.map((board: BoardData, index: number) => (
          <Grid item xs={3} key={index}>
            <BoardButton
              variant="contained"
              color="secondary"
              onClick={() => {
                router.push(
                  `/tribe/${tribe.teamId}/board/${board._id}`,
                  undefined
                );
              }}
            >
              <ButtonText>{board.name}</ButtonText>
            </BoardButton>
          </Grid>
        ))}

        <Grid item xs={3}>
          {user && tribe.roles[user.id] === "admin" && (
            <CreateBoardButton
              variant="outlined"
              disabled={tribe.roles[user?.id] !== "admin"}
              onClick={() => setIsOpen(true)}
            >
              <ButtonText>Create new space</ButtonText>
              <AddCircleOutlineIcon sx={{ color: "#eaeaea" }} />
            </CreateBoardButton>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

const Container = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  marginTop: 8,
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
