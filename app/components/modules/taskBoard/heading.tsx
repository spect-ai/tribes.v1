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
import { useBoard } from ".";
import BoardSettings from "../boardSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Link from "next/link";
import { getBoards } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import Payment from "../payment";
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import CreateEpochModal from "../epoch/createEpochModal";

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
  const { data, tab, handleTabChange } = useBoard();
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { Moralis, isInitialized } = useMoralis();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setIsLoading(true);
      getBoards(Moralis, parseInt(id))
        .then((res: any) => {
          setBoards(res);
        })
        .catch((err: any) => alert(err));
      setIsLoading(false);
    }
  }, [isInitialized, data.name]);

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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0 }}>
        <Link href={`/tribe/${id}`} passHref>
          <MuiLink
            color="inherit"
            underline="hover"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <GroupsIcon sx={{ fontSize: 14 }} />
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
            fontSize: 14,
          }}
          href=""
        >
          <DashboardIcon sx={{ fontSize: 12 }} />
          {data.name}
        </MuiLink>
      </Breadcrumbs>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mx: 2 }}>
          {data.name}
        </Typography>
        <BoardSettings />
        <Payment />
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
            <IconButton sx={{ mb: 0, p: 1.7 }} size="small">
              <RefreshIcon />
            </IconButton>
          </MuiLink>
        </Tooltip>
        {/* <Tooltip title="Invite member">
          <IconButton sx={{ mb: 0, p: 1.7 }} size="small">
            <PeopleOutlineIcon />
          </IconButton>
        </Tooltip> */}
        <CreateEpochModal />
      </Box>
      {/*<Typography sx={{ ml: 2, fontSize: 14 }} color="rgba(255, 255, 255, 0.5)">
        {"This space is for project planning, discussions, and more."}
        </Typography>*/}
      <StyledTabs value={tab} onChange={handleTabChange}>
        <StyledTab label="Board" />
        <StyledTab label="Epoch" />
      </StyledTabs>
    </Container>
  );
};

export default Heading;
