import type { NextPage } from "next";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Box,
  styled,
  Typography,
  Avatar,
  Grid,
} from "@mui/material";
import Link from "next/link";
import {
  StyledTab,
  StyledTabs,
} from "../app/components/elements/styledComponents";
import { useEffect, useState } from "react";
import { getPublicTeams } from "../app/adapters/moralis";
import { useMoralis } from "react-moralis";
import { Team } from "../app/types";
import {
  setNavbarLogo,
  setNavbarTitle,
  useGlobal,
} from "../app/context/globalContext";
import { tribesLogo } from "../app/constants";
import Head from "next/head";
import Navbar from "../app/components/modules/navbar";

type Props = {
  image: string;
  title: string;
  members: number;
  teamId: string;
};

const Home: NextPage = () => {
  const [tab, setTab] = useState(0);
  const [tribes, setTribes] = useState<Team[]>([] as Team[]);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const { dispatch } = useGlobal();
  const { Moralis, isInitialized } = useMoralis();
  useEffect(() => {
    if (isInitialized) {
      setNavbarLogo(dispatch, tribesLogo);
      setNavbarTitle(dispatch, "");
      getPublicTeams(Moralis).then((res: any) => {
        setTribes(res);
        console.log(res);
      });
    }
  }, [isInitialized]);
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <StyledTabs value={tab} onChange={handleTabChange} centered>
          <StyledTab label="Explore Tribes" />
          {/* <StyledTab label="Explore Gigs (coming soon)" disabled /> */}
        </StyledTabs>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            paddingLeft: 2,
            paddingRight: 2,
            mt: 4,
          }}
        >
          <Grid container spacing={2} columns={15}>
            {tribes.map((tribe: Team, index: number) => (
              <Grid item xs={3} key={index}>
                <DAOCards
                  image={tribe.logo}
                  title={tribe.name}
                  members={tribe.members.length}
                  teamId={tribe.teamId}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

const TribeAvatar = styled(Avatar)(({ theme }) => ({
  height: 70,
  width: 70,
  objectFit: "cover",
}));

const DAOCards = ({ image, title, members, teamId }: Props) => {
  return (
    <Card
      sx={{
        padding: 3,
        backgroundColor: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 4,
        border: "1px solid #5a6972",
        margin: "0px 8px",
      }}
    >
      <TribeAvatar alt="Remy Sharp" src={image} />
      <CardContent>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ textAlign: "center", maxHeight: "4rem", overflow: "hidden" }}
        >
          {title}
        </Typography>
        <Typography
          gutterBottom
          component="div"
          sx={{ textAlign: "center", color: "#5a6972", fontSize: 12 }}
        >
          {members} members
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 0 }}>
        <Link href={`/tribe/${teamId}`} passHref>
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
        </Link>
      </CardActions>
    </Card>
  );
};

export default Home;
