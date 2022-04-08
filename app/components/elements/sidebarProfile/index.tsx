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
import { useProfileInfo } from "../../../hooks/useProfileInfo";

type Props = {};

const SidebarProfile = (props: Props) => {
  const { Moralis, user, isAuthenticated, authenticate, isAuthenticating } =
    useMoralis();
  const { avatar } = useProfileInfo();

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
      {!isAuthenticated && (
        <SidebarButton
          sx={{ mt: 2 }}
          color="inherit"
          loading={isAuthenticating}
          onClick={() => {
            authenticate()
              .then((res) => {
                getOrCreateUser(Moralis).then((res: any) => console.log(res));
              })
              .catch((err) => console.log(err));
          }}
        >
          <LoginIcon />
          <Typography sx={{ textTransform: "none", fontSize: 14, ml: 2 }}>
            Connect
          </Typography>
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
            src={avatar}
          />
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
