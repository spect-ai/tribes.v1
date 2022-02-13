import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Link as MuiLink,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useBoard } from ".";
import BoardSettings from "../boardSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";

type Props = {};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`;

const StyledIcon = styled.div`
  font-size: 16px;
  color: #eaeaea;
`;

const Heading = (props: Props) => {
  const { data } = useBoard();
  const router = useRouter();
  const id = router.query.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Container>
      <Drawer anchor={"right"} open={isOpen} onClose={handleClose}>
        <List>
          {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link href={`/tribe/${id}`} passHref>
          <MuiLink
            color="inherit"
            underline="hover"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <GroupsIcon />
            Tribe
          </MuiLink>
        </Link>
        <MuiLink
          color="inherit"
          underline="hover"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          href=""
        >
          <DashboardIcon sx={{ fontSize: 16 }} />
          {data.name}
        </MuiLink>
      </Breadcrumbs>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Avatar src="" />
        <Typography variant="h6" sx={{ mx: 2 }}>
          {data.name}
        </Typography>
        <BoardSettings />
        <Tooltip title="Switch Board">
          <IconButton
            sx={{ mb: 0.5, p: 2.5 }}
            size="small"
            onClick={() => setIsOpen(true)}
          >
            <StyledIcon className="fa-solid fa-arrow-right-arrow-left"></StyledIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <MuiLink href="">
            <IconButton sx={{ mb: 0.5, p: 1.7 }} size="small">
              <RefreshIcon />
            </IconButton>
          </MuiLink>
        </Tooltip>
      </Box>
    </Container>
  );
};

export default Heading;
