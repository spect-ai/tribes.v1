import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Box,
  styled,
  IconButton,
  Typography,
  alpha,
  InputBase,
  Avatar,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { padding } from "@mui/system";

type Props = {};

const TribeAvatar = styled(Avatar)(({ theme }) => ({
  height: 96,
  width: 96,
  objectFit: "cover",
}));

const DAOCards = (props: Props) => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        minWidth: 180,
        padding: 4,
        backgroundColor: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 3,
        border: "1px solid #5a6972",
        margin: "0px 9px",
      }}
    >
      <TribeAvatar alt="Remy Sharp" />
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          The Graph
        </Typography>
        <Typography
          gutterBottom
          component="div"
          sx={{ textAlign: "center", color: "#5a6972", fontSize: 13 }}
        >
          42k members
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          sx={{
            borderRadius: 4,
            borderColor: "#5a6972",
            color: "#5a6972",
            width: 100,
            textTransform: "none",
          }}
        >
          View
        </Button>
      </CardActions>
    </Card>
  );
};

const CreateTeamButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #99ccff",
  width: "3rem",
  height: "3rem",
  color: theme.palette.text.secondary,
}));
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  border: "1px solid #EAEAEA",
  backgroundColor: "inherit",
  marginLeft: 0,
  marginRight: "auto",
  width: "30%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "30%",
  },
}));
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "30%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const Home: NextPage = () => {
  return (
    <div>
      <Box
        sx={{
          marginBottom: 4,
          paddingLeft: 2,
          paddingRight: 12,
          display: "flex",
          marginTop: 4,
        }}
      >
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>
        <Typography
          sx={{
            color: "#5a6972",
          }}
        >
          4 DAOs
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            paddingLeft: 2,
            paddingRight: 12,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <DAOCards />
            </Grid>
            <Grid item xs={3}>
              <DAOCards />
            </Grid>
            <Grid item xs={3}>
              <DAOCards />
            </Grid>
            <Grid item xs={3}>
              <DAOCards />
            </Grid>
          </Grid>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "inherit",
            margin: 2,
            height: "50%",
            padding: 4,
            borderRadius: 3,
            border: "1px solid #EAEAEA",
            gap: 1,
          }}
        >
          <CreateTeamButton>
            <AddIcon />
          </CreateTeamButton>
          Create DAO
        </Box> */}
      </Box>
    </div>
  );
};

export default Home;
