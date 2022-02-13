/* eslint-disable @next/next/no-html-link-for-pages */
import { LoadingButton } from "@mui/lab";
import { Avatar, Box, ButtonProps, styled, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import { useMoralis } from "react-moralis";
import Logo from "../../../images/tribesLogo.png";
import { smartTrim } from "../../../utils/utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getOrCreateUser } from "../../../adapters/moralis";
import Notifications from "../notifications";
type Props = {};

const StyledNav = styled("nav")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: "4.2rem",
  width: "100%",
  paddingTop: "0.4rem",
}));

const NavbarAvatar = styled(Avatar)(({ theme }) => ({
  height: 25,
  width: 25,
  objectFit: "cover",
  borderWidth: 2,
  border: "1px solid #0066FF",
}));

const NavbarButton = styled(LoadingButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#000f29"),
  borderRadius: "22.5px",
  textTransform: "none",
  border: "2px solid #0066FF",
  width: "155px",
  height: "35px",
}));

const Navbar = (props: Props) => {
  const {
    isAuthenticated,
    isAuthenticating,
    authenticate,
    logout,
    user,
    Moralis,
  } = useMoralis();
  return (
    <StyledNav>
      <Box sx={{ pt: 0, mx: 8 }}>
        <a href="/">
          <Image src={Logo} alt="logo" height="50" width="110" />
        </a>
      </Box>
      <Box sx={{ flex: "1 1 auto" }} />
      {isAuthenticated ? (
        <Box>
          <Notifications />
        </Box>
      ) : (
        <></>
      )}
      <Box sx={{ mr: 8, ml: 4 }}>
        {!isAuthenticated ? (
          <NavbarButton
            variant="outlined"
            loading={isAuthenticating}
            onClick={() =>
              authenticate({
                // provider: "web3Auth",
                // // @ts-ignore
                // clientId:
                //   "BADQJ8pY7u0cgWmzwXyNeOwi-gl6b4EgLk0076mEnIIwg39vAOCqrFiaL8n7khrPFLwikwyH15RT_KZyjlGkkZg",
                // appLogo:
                //   "https://ipfs.moralis.io:2053/ipfs/QmXwQkaegqMCH3J3HYvHVkSjRJP83dLpzQxAuu9UGYQKEM",
                // // @ts-ignore
                // chainId: Moralis.Chains.POLYGON_MAINNET,
              })
                .then((res) => {
                  console.log(res);
                  getOrCreateUser(Moralis).then((res: any) => console.log(res));
                })
                .catch((err) => console.log(err))
            }
          >
            <Typography sx={{ mx: 2, fontSize: 15 }}>Connect Wallet</Typography>
          </NavbarButton>
        ) : (
          <NavbarButton
            variant="outlined"
            endIcon={<ExpandMoreIcon color="primary" />}
            onClick={() => {
              logout();
            }}
          >
            <NavbarAvatar />
            <Typography sx={{ ml: 1, fontSize: 14 }}>
              {smartTrim(user?.get("ethAddress"), 10)}
            </Typography>
          </NavbarButton>
        )}
      </Box>
    </StyledNav>
  );
};

export default Navbar;
