import styled from "@emotion/styled";
import { createTheme, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { PageContainer } from "../../../pages/tribe/[id]/space/[bid]";
import { getTheme } from "../../constants/muiTheme";
import GlobalContextProvider, {
  initContracts,
  initRegistry,
  updateUser,
  useGlobal,
} from "../../context/globalContext";
import { useDiscord } from "../../hooks/useDiscord";
import { useMoralisFunction } from "../../hooks/useMoralisFunction";
interface Props {
  children: React.ReactNode;
}

const OuterDiv = styled.div`
  position: relative;
  width: 100%;
  letter-spacing: 0.025em;
  line-height: 1.5;
  font-size: 1.5rem;
  overflow-x: hidden;
  display: flex;
  @media (max-width: 720px) {
    display: none;
  }
`;

const MobileDiv = styled.div`
  width: 100%;
  align-items: center;
  justify-content: center;
  @media (min-width: 720px) {
    display: none;
  }
`;

const InnerDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Main = styled.main`
  flex-grow: 1;
`;

const Layout = ({ children }: Props) => {
  const { Moralis, isInitialized, user, isAuthenticated } = useMoralis();
  const { refreshDiscordUser } = useDiscord();
  const { runMoralisFunction } = useMoralisFunction();
  const { dispatch, state } = useGlobal();

  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      initContracts(dispatch);
      initRegistry(dispatch, Moralis);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log("initalizewd", user);
      runMoralisFunction("refreshDiscordUser", {}).then((res) => {
        if (res.objectId) {
          console.log(res);
          updateUser(dispatch, res);
        } else {
          console.error(res);
        }
      });
    }
  }, [isInitialized, isAuthenticated]);

  useEffect(() => {
    if (router.query.code) {
      console.log("linking user");
      runMoralisFunction("linkDiscordUser", { code: router.query.code }).then(
        (res) => {
          console.log(res);
          updateUser(dispatch, res);
          router.push("/");
        }
      );
    }
  }, [router.query.code]);

  return (
    <>
      <OuterDiv>
        <Main>{children}</Main>
        {/* <Footer /> */}
      </OuterDiv>
      <MobileDiv>
        <PageContainer theme={createTheme(getTheme(0))}>
          <Typography sx={{ color: "#eaeaea", margin: "auto" }}>
            Mobile Not Supported yet!
          </Typography>
        </PageContainer>
      </MobileDiv>
    </>
  );
};

// console.log(router.query.userId);
// if (router.query.userId) {
//   runMoralisFunction("getUserInfo", { userId: router.query.userId }).then(
//     (res) => {
//       console.log(res);
//       localStorage.setItem("objectId", res.objectId);
//       updateUser(dispatch, res);
//     }
//   );
// }
// if (localStorage.getItem("objectId") !== "undefined") {
//   refreshDiscordUser(localStorage.getItem("objectId") as string).then((res) => {
//     console.log(res);
//     updateUser(dispatch, res);
//   });
// }
export default Layout;
