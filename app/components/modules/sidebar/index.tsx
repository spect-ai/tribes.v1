import { Avatar, Button, IconButton, styled, Tooltip } from "@mui/material";
import Image from "next/image";
import React from "react";
import Logo from "../../../images/logo2.svg";
import AddIcon from "@mui/icons-material/Add";

type Props = {};

const SidebarDiv = styled("div")(({ theme }) => ({
  minHeight: "100vh",
  width: "5%",
  borderRight: "1px solid #e0e0e0",
  paddingTop: "4rem",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
}));

const SidebarAvatar = styled(Avatar)(({ theme }) => ({
  width: "3rem",
  height: "3rem",
  objectFit: "cover",
}));

const CreateTeamButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #eaeaea",
  marginTop: "1rem",
  width: "3rem",
  height: "3rem",
}));

const Sidebar = (props: Props) => {
  return (
    <SidebarDiv>
      <SidebarAvatar alt="Username" />
      <Tooltip title="Create tribe">
        <CreateTeamButton>
          <AddIcon />
        </CreateTeamButton>
      </Tooltip>
    </SidebarDiv>
  );
};

export default Sidebar;
