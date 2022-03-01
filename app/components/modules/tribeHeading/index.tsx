import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Drawer,
  IconButton,
  List,
  Link as MuiLink,
  ListItemText,
  Tooltip,
  Typography,
  ListItemButton,
  styled as MUIStyled,
  Tabs,
  Tab,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import BoardSettings from "../boardSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Link from "next/link";
import { getBoards } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
// import BatchPay from "../batchPay";
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import CreateEpochModal from "../epoch/createEpochModal";
import { useTribe } from "../../../../pages/tribe/[id]";

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

const TribeHeading = (props: Props) => {
  const { tab, handleTabChange, tribe } = useTribe();
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { Moralis, isInitialized } = useMoralis();
  const [boards, setBoards] = useState([]);

  return (
    <Container>
      <Drawer anchor={"right"} open={isOpen} onClose={handleClose}>
        <List
          sx={{ maxWidth: "10rem", backgroundColor: "#00194A", height: "100%" }}
        >
          {boards.map((board: any, index) => (
            <Link
              href={`/tribe/${id}/board/${board.objectId}`}
              key={board.objectId}
              passHref
            >
              <ListItemButton selected={board.objectId === bid}>
                <ListItemText primary={board.name} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Drawer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ml: 4,
        }}
      >
        <Typography variant="h6" sx={{ mx: 2 }}>
          {tribe.name}
        </Typography>
        <Tooltip title="Invite member">
          <IconButton sx={{ mb: 0.5, p: 1.7 }} size="small">
            <PeopleOutlineIcon />
          </IconButton>
        </Tooltip>
        {/* <CreateEpochModal /> */}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Typography
          sx={{ ml: 6, fontSize: 14 }}
          color="rgba(255, 255, 255, 0.5)"
        >
          {tribe.description}
        </Typography>
        <Box sx={{ mx: 2 }} />
        <StyledAnchor href={tribe.github} target="_blank">
          <i className="fab fa-github" />
        </StyledAnchor>
        <StyledAnchor href={tribe.discord} target="_blank">
          <i className="fab fa-discord"></i>
        </StyledAnchor>
        <StyledAnchor href={tribe.twitter} target="_blank">
          <i className="fab fa-twitter" />
        </StyledAnchor>
      </Box>
      <StyledTabs value={tab} onChange={handleTabChange}>
        <StyledTab label="Overview" />
        <StyledTab label="Epochs" disabled />
        <StyledTab label="Settings" />
      </StyledTabs>
    </Container>
  );
};

const StyledAnchor = MUIStyled("a")(({ theme }) => ({
  color: "rgb(90, 105, 114,0.6)",
  marginRight: "1rem",
  fontSize: "1.2rem",
  transition: "0.3s ease-in-out",
  "&:hover": {
    color: "rgb(90, 105, 114,1)",
  },
}));

export default TribeHeading;
