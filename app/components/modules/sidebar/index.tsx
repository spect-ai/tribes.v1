import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React from "react";
import Logo from "../../../images/logo2.svg";
import CreateTribeModal from "../createTribeModal";

type Props = {};

// const SidebarDiv = styled("div")(({ theme }) => ({
//   minHeight: "100vh",
//   width: "6rem",
//   paddingTop: "10rem",
//   alignItems: "center",
//   display: "flex",
//   flexDirection: "column",
//   backgroundColor: "#00194A",
//   position: "fixed", /* Fixed Sidebar (stay in place on scroll) */
//   z-index: 1, /* Stay on top */
// }));

const SidebarContainer = styled.div`
  minheight: 100vh;
  display: flex;
  flex-direction: column;
  width: 6rem;
  padding-top: 10rem;
  align-items: center;
  background-color: #00194a;
  z-index: 1; /* Stay on top */
`;

// const SidebarAvatar = styled(Avatar)(({ theme }) => ({
//   width: "3rem",
//   height: "3rem",
//   objectFit: "cover",
// }));

const Sidebar = (props: Props) => {
  return (
    <SidebarContainer>
      <Box
        sx={{
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          alt="Username"
          sx={{ width: "3rem", height: "3rem", objectFit: "cover" }}
        />
        <CreateTribeModal />
        <Typography
          sx={{ fontSize: 13, textAlign: "center", mt: 1, fontWeight: "bold" }}
          color="text.secondary"
          gutterBottom
        >
          Create Tribe
        </Typography>
      </Box>
    </SidebarContainer>
  );
};

export default Sidebar;
