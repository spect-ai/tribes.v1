import {
  Avatar,
  Box,
  Button,
  IconButton,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React from "react";
import Logo from "../../../images/logo2.svg";
import AddIcon from "@mui/icons-material/Add";

type Props = {};

const SidebarDiv = styled("div")(({ theme }) => ({
  minHeight: "100vh",
  width: "6rem",
  paddingTop: "10rem",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#00194A",
}));

const SidebarAvatar = styled(Avatar)(({ theme }) => ({
  width: "3rem",
  height: "3rem",
  objectFit: "cover",
}));

const CreateTeamButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #99ccff",
  marginTop: "1rem",
  width: "3rem",
  height: "3rem",
  color: theme.palette.text.secondary,
}));

const Sidebar = (props: Props) => {
  return (
    <SidebarDiv>
      <Box
        sx={{
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SidebarAvatar alt="Username" />
        <CreateTeamButton>
          <AddIcon />
        </CreateTeamButton>
        <Typography
          sx={{ fontSize: 13, textAlign: "center", mt: 1, fontWeight: "bold" }}
          color="text.secondary"
          gutterBottom
        >
          Create DAO
        </Typography>
      </Box>
    </SidebarDiv>
  );
};

export default Sidebar;
