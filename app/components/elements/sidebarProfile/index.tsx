import { Avatar, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import ProfilePopover from "../../modules/profilePopover";
import { AvatarText, ButtonText } from "../../modules/spaceSidebar";
import { SidebarButton } from "../styledComponents";
import LoginIcon from "@mui/icons-material/Login";
import { smartTrim } from "../../../utils/utils";
import styled from "@emotion/styled";

type Props = {};

const SidebarProfile = (props: Props) => {
  const { user, isAuthenticated, authenticate } = useMoralis();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

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
            <Typography sx={{ fontSize: 12, color: palette.primary.light }}>
              {smartTrim(user?.get("ethAddress"), 10)}
            </Typography>
          </AvatarText>
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
  border-top: 1px solid #5a6972;
  margin-bottom: 1rem;
`;

export default SidebarProfile;
