import { Avatar, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import ProfilePopover from "../../modules/profilePopover";
import { SidebarButton } from "../styledComponents";
import LoginIcon from "@mui/icons-material/Login";
import styled from "@emotion/styled";
import { getMD5String } from "../../../utils/utils";
import { getOrCreateUser } from "../../../adapters/moralis";
import { useGlobal } from "../../../context/globalContext";
import { useRouter } from "next/router";

type Props = {};

const SidebarProfile = (props: Props) => {
  const { Moralis, user, isAuthenticated, authenticate, isAuthenticating } =
    useMoralis();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const router = useRouter();

  const {
    state: { currentUser },
  } = useGlobal();
  const handleClick =
    (field: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    };
  const handleClosePopover = () => {
    setOpen(false);
  };
  const { palette } = useTheme();
  return (
    <Profile>
      {!currentUser?.username && (
        <SidebarButton
          sx={{ mt: 2 }}
          color="inherit"
          loading={isAuthenticating}
          onClick={() => {
            router.push(
              "https://discord.com/api/oauth2/authorize?client_id=942494607239958609&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&response_type=code&scope=identify%20email"
            );
          }}
        >
          <LoginIcon />
          <Typography sx={{ textTransform: "none", fontSize: 14, ml: 2 }}>
            Connect
          </Typography>
        </SidebarButton>
      )}
      {currentUser?.username && (
        <SidebarButton
          sx={{ mt: 2 }}
          color="inherit"
          onClick={handleClick("profile")}
        >
          <Avatar
            variant="rounded"
            sx={{ p: 0, m: 0, width: 32, height: 32 }}
            src={`https://cdn.discordapp.com/avatars/${currentUser?.userId}/${currentUser?.avatar}.png`}
          >
            {user?.get("username")[0]}
          </Avatar>
        </SidebarButton>
      )}
      <ProfilePopover
        open={open}
        anchorEl={anchorEl}
        handleClose={handleClosePopover}
      />
    </Profile>
  );
};

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  margin-right: 1rem;
`;

export default SidebarProfile;
