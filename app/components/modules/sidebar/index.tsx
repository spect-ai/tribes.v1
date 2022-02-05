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
import CreateTribeModal from "../createTribeModal";

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
        <CreateTribeModal />
        <Typography
          sx={{ fontSize: 13, textAlign: "center", mt: 1, fontWeight: "bold" }}
          color="text.secondary"
          gutterBottom
        >
          Create Tribe
        </Typography>
      </Box>
    </SidebarDiv>
  );
};

export default Sidebar;
