import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Collapse,
  Palette,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { SidebarButton } from "../../elements/styledComponents";
import NotificationIcon from "@mui/icons-material/Notifications";
import { smartTrim } from "../../../utils/utils";
import PaletteIcon from "@mui/icons-material/Palette";
import BallotIcon from "@mui/icons-material/Ballot";
import ThemePopover, { OptionsButton } from "../themePopover";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import BoardSettings from "../boardSettings";
import ViewTribePopover from "../viewTribePopover";
import Payment from "../payment/batchPayIcon";
import CreateEpoch from "../epoch/createEpochModal";
import SpacesPopover from "../spacesPopover";
import ProfilePopover from "../profilePopover";
import LoginIcon from "@mui/icons-material/Login";

type Props = {};

const Sidebar = (props: Props) => {
  const { user, isAuthenticated, authenticate } = useMoralis();
  const [myTeams, setMyTeams] = useState([] as any[]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { space, isLoading } = useSpace();

  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);

  const { palette } = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState({} as any);

  const handleClick =
    (field: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen({ [field]: true });
    };
  const handleClosePopover = (field: string) => {
    setOpen({ [field]: false });
  };
  return (
    <SidebarContainer
      onMouseEnter={onMouseHover}
      onMouseLeave={onMouseLeave}
      palette={palette}
    >
      <Collapse orientation="horizontal" in={!isCollapsed} collapsedSize={50}>
        <SidebarContent>
          {!isLoading && space?.team ? (
            <Actions>
              <SidebarButton
                sx={{ mt: 2 }}
                color="inherit"
                onClick={handleClick("viewTribe")}
              >
                <Avatar
                  variant="rounded"
                  sx={{ p: 0, m: 0, width: 32, height: 32 }}
                  src={space.team[0].logo}
                >
                  {space.team[0].name && space.team[0].name[0]}
                </Avatar>
                <AvatarText>
                  <Typography sx={{ fontSize: 15 }}>
                    {space.team[0].name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: palette.primary.light }}
                  >
                    {space.team[0]?.members?.length} members
                  </Typography>
                </AvatarText>
              </SidebarButton>
              <ViewTribePopover
                open={open["viewTribe"]}
                anchorEl={anchorEl}
                handleClose={handleClosePopover}
                type="viewTribe"
              />
              <Box sx={{ mt: 12, display: "flex", flexDirection: "column" }}>
                <SidebarButton color="inherit">
                  <NotificationIcon />
                  <ButtonText>Notification</ButtonText>
                </SidebarButton>
                {space.roles[user?.id as string] === "admin" && (
                  <BoardSettings />
                )}
                <CreateEpoch />
                {space.roles[user?.id as string] === "admin" && <Payment />}
                <SidebarButton color="inherit" onClick={handleClick("theme")}>
                  <PaletteIcon />
                  <ButtonText>Theme</ButtonText>
                </SidebarButton>
                <ThemePopover
                  open={open["theme"]}
                  anchorEl={anchorEl}
                  handleClose={handleClosePopover}
                  type="theme"
                />

                <SidebarButton color="inherit" onClick={handleClick("spaces")}>
                  <BallotIcon />
                  <ButtonText>Spaces</ButtonText>
                </SidebarButton>
                <SpacesPopover
                  open={open["spaces"]}
                  anchorEl={anchorEl}
                  handleClose={handleClosePopover}
                  type="spaces"
                />
              </Box>
              <Box
                sx={{ mt: 12, display: "flex", flexDirection: "column" }}
              ></Box>
            </Actions>
          ) : (
            <div>loading</div>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          <Profile>
            {!isAuthenticated && (
              <SidebarButton
                sx={{ mt: 2 }}
                color="inherit"
                onClick={() => authenticate()}
              >
                <LoginIcon />
                <ButtonText>Connect Wallet</ButtonText>
              </SidebarButton>
            )}
            {isAuthenticated && (
              <SidebarButton
                sx={{ mt: 2 }}
                color="inherit"
                onClick={handleClick("profile")}
              >
                <Avatar
                  variant="rounded"
                  sx={{ p: 0, m: 0, width: 32, height: 32 }}
                  src={user?.get("profilePicture")._url}
                >
                  {user?.get("username")[0]}
                </Avatar>

                <AvatarText>
                  <Typography sx={{ fontSize: 15 }}>
                    {user?.get("username")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: palette.primary.light }}
                  >
                    {smartTrim(user?.get("ethAddress"), 10)}
                  </Typography>
                </AvatarText>
              </SidebarButton>
            )}
            <ProfilePopover
              open={open["profile"]}
              anchorEl={anchorEl}
              handleClose={handleClosePopover}
              type="profile"
            />
          </Profile>
        </SidebarContent>
      </Collapse>
    </SidebarContainer>
  );
};

export const SidebarContainer = styled.div<{ palette: Palette }>`
  background-color: ${(props) => props.palette.primary.main};
  transition: 0.5s;
`;

export const SidebarContent = styled.div`
  min-width: 250px;
`;

export const Actions = styled.div`
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

export const ButtonText = styled.div`
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
