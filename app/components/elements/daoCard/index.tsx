import styled from "@emotion/styled";
import {
  Avatar,
  Button,
  Palette,
  styled as MUIStyled,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import React from "react";
import { normalTrim } from "../../../utils/utils";

type Props = {
  image: string;
  title: string;
  members: number;
  teamId: string;
};

const DAOCard = ({ image, title, members, teamId }: Props) => {
  const { palette } = useTheme();
  return (
    <Link href={`/tribe/${teamId}`} passHref>
      <Card palette={palette}>
        <CardContent>
          <TribeAvatar alt="Remy Sharp" src={image} />
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            color={palette.text.primary}
            sx={{ textAlign: "center", maxHeight: "4rem", overflow: "hidden" }}
          >
            {normalTrim(title, 17)}
          </Typography>
          <Typography
            gutterBottom
            component="div"
            sx={{ textAlign: "center", color: "#5a6972", fontSize: 13 }}
          >
            {members} members
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            disableElevation
            sx={{
              borderRadius: 2,
              width: 100,
              textTransform: "none",
              mt: 4,
            }}
          >
            Join
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

const TribeAvatar = MUIStyled(Avatar)(({ theme }) => ({
  height: 60,
  width: 60,
  objectFit: "cover",
}));

const Card = styled.div<{ palette: Palette }>`
  width: 100%;
  height: 14rem;
  border: 1px solid ${(props) => props.palette.divider};
  border-radius: 12px;
  &:hover {
    cursor: pointer;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid ${(props) => props.palette.text.primary};
  }
  transition: all 0.5s ease;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
`;

export default DAOCard;
