/* eslint-disable @next/next/no-html-link-for-pages */
import { Avatar, Box, ButtonProps, styled, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import { useMoralis } from "react-moralis";
import Logo from "../../../images/tribesLogo.png";
import { smartTrim } from "../../../utils/utils";
import { getOrCreateUser } from "../../../adapters/moralis";
import Notifications from "../notifications";
import { NavbarButton } from "../../elements/styledComponents";
import ProfileMenu from "../profileMenu";
import Link from "next/link";
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
        {/* <Link href="/" passHref>
          <Image src={Logo} alt="logo" height="50" width="110" />
        </Link> */}
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
          <ProfileMenu />
        )}
      </Box>
    </StyledNav>
  );
};

export default Navbar;
