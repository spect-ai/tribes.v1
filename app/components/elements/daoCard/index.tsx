import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  styled,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";

type Props = {
  image: string;
  title: string;
  members: number;
  teamId: string;
};

const DAOCard = ({ image, title, members, teamId }: Props) => {
  return (
    <Card
      sx={{
        padding: 3,
        backgroundColor: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 1,
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
            color="secondary"
            disableElevation
            sx={{
              borderRadius: 4,
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

const TribeAvatar = styled(Avatar)(({ theme }) => ({
  height: 60,
  width: 60,
  objectFit: "cover",
}));

export default DAOCard;
