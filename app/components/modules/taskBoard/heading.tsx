import styled from "@emotion/styled";
import {
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
import { getEssentialBoardsInfo, joinSpace } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import Payment from "../payment/batchPayIcon";
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import CreateEpochModal from "../epoch/createEpochModal";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { notify, notifyError } from "../settingsTab";
import { Toaster } from "react-hot-toast";

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
  const { data, setData, tab, handleTabChange } = useBoard();
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const [isOpen, setIsOpen] = useState(false);
  const [isEpochModalOpen, setIsEpochModalOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { Moralis, isInitialized, user } = useMoralis();
  const [boards, setBoards] = useState([]);
  const [isLoadingJoinSpace, setIsLoadingJoinSpace] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      getEssentialBoardsInfo(Moralis, id)
        .then((res: any) => {
          console.log(`res`);

          console.log(res);
          setBoards(res);
        })
        .catch((err: any) =>
          notifyError("Sorry! There was an error while getting your space")
        );
    }
  }, [isInitialized, data.name]);

  return (
    <Container>
      <Toaster />
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0, ml: 2 }}>
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
            {data.team[0].name}
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
        {data.roles[user?.id as string] === "admin" && <BoardSettings />}
        {data.roles[user?.id as string] === "admin" && <Payment />}
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
        {data.members.indexOf(user?.id as string) === -1 &&
          data.tokenGating.tokenLimit > 0 && (
            <Tooltip title="You can join space if you have enough tokens">
              <PrimaryButton
                variant="outlined"
                sx={{ borderRadius: 1, mx: 4 }}
                loading={isLoadingJoinSpace}
                onClick={async () => {
                  setIsLoadingJoinSpace(true);
                  joinSpace(Moralis, bid)
                    .then((res: any) => {
                      console.log(res);
                      setIsLoadingJoinSpace(false);
                      setData(res);
                      notify("Joined Space Succesfully");
                    })
                    .catch((err: any) => {
                      setIsLoadingJoinSpace(false);
                      notify(err.message, "error");
                    });
                }}
              >
                Join Space
              </PrimaryButton>
            </Tooltip>
          )}
        {/* <Tooltip title="Invite member">
          <IconButton sx={{ mb: 0, p: 1.7 }} size="small">
            <PeopleOutlineIcon />
          </IconButton>
        </Tooltip> */}
        {data.roles[user?.id as string] === "admin" && (
          <Tooltip title="Start Epoch">
            <IconButton
              sx={{ p: 1.7 }}
              size="small"
              onClick={() => setIsEpochModalOpen(true)}
            >
              <PlayCircleFilledWhiteIcon />
            </IconButton>
          </Tooltip>
        )}
        {isEpochModalOpen && (
          <CreateEpochModal
            isOpen={isEpochModalOpen}
            setIsOpen={setIsEpochModalOpen}
          />
        )}
      </Box>
      {/* <Typography sx={{ ml: 2, fontSize: 14 }} color="rgba(255, 255, 255, 0.5)">
        {data.description}
      </Typography> */}
      <StyledTabs value={tab} onChange={handleTabChange}>
        <StyledTab label="Board" />
        <StyledTab label="Epoch" />
        <StyledTab label="Members" />
      </StyledTabs>
    </Container>
  );
};

export default Heading;
