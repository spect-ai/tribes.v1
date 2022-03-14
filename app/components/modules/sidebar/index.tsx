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
import { getMyTeams } from "../../../adapters/moralis";
import { SidebarButton } from "../../elements/styledComponents";
import NotificationIcon from "@mui/icons-material/Notifications";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import SettingsIcon from "@mui/icons-material/Settings";
import PaidIcon from "@mui/icons-material/Paid";
import { smartTrim } from "../../../utils/utils";

type Props = {};

const Sidebar = (props: Props) => {
  const { Moralis, isInitialized, isAuthenticated } = useMoralis();
  const [myTeams, setMyTeams] = useState([] as any[]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      getMyTeams(Moralis).then((res: any) => {
        setMyTeams(res);
      });
    } else {
      setMyTeams([]);
    }
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
                <Typography sx={{ fontSize: 14 }}>Avp test tribe 1</Typography>
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
              >
                A
              </Avatar>
              <AvatarText>
                <Typography sx={{ fontSize: 14 }}>0xavp.eth</Typography>
                <Typography sx={{ fontSize: 10, color: "#5a6972" }}>
                  {smartTrim("0x6304CE63F2EBf8C0Cc76b60d34Cc52a84aBB6057", 10)}
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
  minheight: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #00194a;
  transition: 0.5s;
`;

const SidebarContent = styled.div`
  min-width: 250px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
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
  width: 100%;
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
