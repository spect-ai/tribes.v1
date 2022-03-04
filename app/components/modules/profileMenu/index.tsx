import {
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  styled,
  Theme,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { NavbarButton } from "../../elements/styledComponents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getMD5String, smartTrim } from "../../../utils/utils";
import { useMoralis } from "react-moralis";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ProfileSettings from "../profileSettings";
import { makeStyles } from "@mui/styles";
import { useRouter } from "next/router";

type Props = {};
const NavbarAvatar = styled(Avatar)(({ theme }) => ({
  height: 25,
  width: 25,
  objectFit: "cover",
  borderWidth: 2,
}));

export const useStyles = makeStyles((theme: Theme) => ({
  menuPaper: {
    backgroundColor: theme.palette.background.default,
  },
}));

const ProfileMenu = (props: Props) => {
  const { isAuthenticating, logout, user } = useMoralis();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const handleSettingsClose = () => setIsOpen(false);
  const open = Boolean(anchorEl);

  const router = useRouter();
  const classes = useStyles();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <ProfileSettings isOpen={isOpen} handleClose={handleSettingsClose} />
      <NavbarButton
        variant="outlined"
        endIcon={<ExpandMoreIcon sx={{ color: "#99ccff" }} />}
        onClick={handleClick}
        loading={isAuthenticating}
      >
        <NavbarAvatar
          src={
            user?.get("profilePicture")?._url ||
            `https://www.gravatar.com/avatar/${getMD5String(
              user?.id || ""
            )}?d=identicon&s=32`
          }
        />
        <Typography sx={{ ml: 1, fontSize: 14 }}>
          {smartTrim(user?.get("ethAddress"), 10)}
        </Typography>
      </NavbarButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{ p: 0, m: 0 }}
        classes={{ paper: classes.menuPaper }}
      >
        <MenuList dense sx={{ p: 0, m: 0 }}>
          <MenuItem
            dense
            sx={{ px: 2, py: 0 }}
            onClick={() => {
              handleClose();
              setIsOpen(true);
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText>Profile Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            dense
            sx={{ px: 3, py: 0 }}
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default ProfileMenu;
