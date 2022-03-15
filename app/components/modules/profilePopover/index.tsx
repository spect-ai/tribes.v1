import { Popover, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { useMoralis } from "react-moralis";
import ProfileSettings from "../profileSettings";
import { OptionsButton, SidebarPopoverContainer } from "../themePopover";
import LogoutIcon from "@mui/icons-material/Logout";
import { ButtonText } from "../spaceSidebar";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

const ProfilePopover = ({ open, anchorEl, handleClose, type }: Props) => {
  const { palette } = useTheme();
  const { logout } = useMoralis();
  const router = useRouter();
  const id = router.query.id;
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <SidebarPopoverContainer palette={palette}>
        <ProfileSettings />
        <OptionsButton
          color="inherit"
          onClick={() => {
            logout();
            router.push(`/tribe/${id}`);
            handleClose(type);
          }}
        >
          <LogoutIcon />
          <ButtonText>Logout</ButtonText>
        </OptionsButton>
      </SidebarPopoverContainer>
    </Popover>
  );
};

export default ProfilePopover;
