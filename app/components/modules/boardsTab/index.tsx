import { Button, Grid, Skeleton, styled } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState, useEffect } from "react";
import CreateBoard from "./createBoard";
import { useTribe } from "../../../../pages/tribe/[id]";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { getBoards } from "../../../adapters/moralis";

type Props = {};

const Board = (props: Props) => {
  const [boards, setBoards] = useState([]);
  const router = useRouter();
  const { tribe } = useTribe();
  const { Moralis } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    getBoards(Moralis, tribe.teamId)
      .then((res: any) => {
        console.log(res);
        setBoards(res);
        setIsLoading(false);
      })
      .catch((err: any) => alert(err));
  }, []);
  return (
    <Container>
      <CreateBoard isOpen={isOpen} handleClose={handleClose} />
      <Grid container spacing={2}>
        {!isLoading &&
          boards.map((board: any, index) => (
            <Grid item xs={3} key={index}>
              <BoardButton
                variant="contained"
                color="secondary"
                onClick={() => {
                  router.push(
                    `/tribe/${tribe.teamId}/board/${board.objectId}`,
                    undefined
                  );
                }}
              >
                <ButtonText>{board.name}</ButtonText>
              </BoardButton>
            </Grid>
          ))}
        {isLoading && (
          <Skeleton
            width={300}
            height={128}
            variant="rectangular"
            animation="wave"
            sx={{ mt: 2, borderRadius: "0.5rem" }}
          />
        )}

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
