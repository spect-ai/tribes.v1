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
import InviteContributorModal from "../settingsTab/inviteContributorModal";

type Props = {};

const TribeHeading = (props: Props) => {
  const { tab, handleTabChange, tribe } = useTribe();
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const [boards] = useState([]);

  return (
    <Container>
      {isOpen && <InviteContributorModal setIsOpen={setIsOpen} />}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ml: 4,
        }}
      >
        <Typography variant="h6">{tribe.name}</Typography>
        <Tooltip title="Invite member">
          <IconButton
            sx={{ mb: 0.5, p: 1.7, ml: 2 }}
            size="small"
            onClick={() => setIsOpen(true)}
          >
            <PeopleOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          ml: 4,
        }}
      >
        <Typography sx={{ fontSize: 14 }} color="rgba(255, 255, 255, 0.5)">
          {tribe.description}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          ml: 4,
        }}
      >
        {tribe.github && (
          <StyledAnchor href={tribe.github} target="_blank">
            <i className="fab fa-github" />
          </StyledAnchor>
        )}
        {tribe.discord && (
          <StyledAnchor href={tribe.discord} target="_blank">
            <i className="fab fa-discord"></i>
          </StyledAnchor>
        )}
        {tribe.twitter && (
          <StyledAnchor href={tribe.twitter} target="_blank">
            <i className="fab fa-twitter" />
          </StyledAnchor>
        )}
      </Box>
      <StyledTabs value={tab} onChange={handleTabChange}>
        <StyledTab label="Overview" />
        <StyledTab label="Settings" />
      </StyledTabs>
    </Container>
  );
};

const StyledAnchor = MUIStyled("a")(({ theme }) => ({
  color: "rgb(90, 105, 114,0.6)",
  marginRight: "0.8rem",
  fontSize: "1.2rem",
  transition: "0.3s ease-in-out",
  "&:hover": {
    color: "rgb(90, 105, 114,1)",
  },
}));

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TribeHeading;
