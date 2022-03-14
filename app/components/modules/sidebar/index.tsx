import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getMyTeams, getTeam } from "../../../adapters/moralis";
import { SidebarButton } from "../../elements/styledComponents";
import NotificationIcon from "@mui/icons-material/Notifications";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import SettingsIcon from "@mui/icons-material/Settings";
import PaidIcon from "@mui/icons-material/Paid";
import { smartTrim } from "../../../utils/utils";
import { useBoard } from "../taskBoard";
import { Team } from "../../../types";

type Props = {};

const Sidebar = (props: Props) => {
  const { Moralis, isInitialized, isAuthenticated, user } = useMoralis();
  const [myTeams, setMyTeams] = useState([] as any[]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tribe, setTribe] = useState({} as Team);
  const { data } = useBoard();

  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);

  useEffect(() => {
    // if (isInitialized && isAuthenticated) {
    // } else {
    // }
  }, [isInitialized, isAuthenticated]);

  return (
    <SidebarContainer onMouseEnter={onMouseHover} onMouseLeave={onMouseLeave}>
      <Collapse orientation="horizontal" in={!isCollapsed} collapsedSize={50}>
        <SidebarContent>
          <Actions>
            <SidebarButton sx={{ mt: 2 }}>
              <Avatar
                variant="rounded"
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
              >
                A
              </Avatar>
              <AvatarText>
                <Typography sx={{ fontSize: 14 }}>{}</Typography>
                <Typography sx={{ fontSize: 10, color: "#5a6972" }}>
                  12 Members
                </Typography>
              </AvatarText>
            </SidebarButton>

            <SidebarButton>
              <NotificationIcon />
              <ButtonText>Notification</ButtonText>
            </SidebarButton>
            <SidebarButton>
              <SettingsIcon />
              <ButtonText>Settings</ButtonText>
            </SidebarButton>
            <SidebarButton>
              <PlayCircleFilledWhiteIcon />
              <ButtonText>Start Epoch</ButtonText>
            </SidebarButton>
            <SidebarButton>
              <PaidIcon />
              <ButtonText>Batch Pay</ButtonText>
            </SidebarButton>
          </Actions>
          <Box sx={{ flex: "1 1 auto" }} />
          <Profile>
            <SidebarButton sx={{ mt: 2 }}>
              <Avatar
                variant="rounded"
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
                src={user?.get("profilePicture")._url}
              >
                {user?.get("username")[0]}
              </Avatar>
              <AvatarText>
                <Typography sx={{ fontSize: 14 }}>
                  {user?.get("username")}
                </Typography>
                <Typography sx={{ fontSize: 10, color: "#5a6972" }}>
                  {smartTrim(user?.get("ethAddress"), 10)}
                </Typography>
              </AvatarText>
            </SidebarButton>
          </Profile>
        </SidebarContent>
      </Collapse>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  background-color: #00194a;
  transition: 0.5s;
`;

const SidebarContent = styled.div`
  min-width: 250px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 89vh;
`;

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #5a6972;
  margin-bottom: 1rem;
`;

const ButtonText = styled.div`
  overflow: hidden;
  height: 20px;
  width: 86%;
  transition: 0.5s;
  text-transform: none;
`;

const AvatarText = styled.div`
  overflow: hidden;
  height: 40px;
  width: 100%;
  transition: 0.5s;
  text-transform: none;
  display: flex;
  flex-direction: column;
`;

export default Sidebar;
