import styled from "@emotion/styled";
import { createTheme, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { PageContainer } from "../../../pages/tribe/[id]/space/[bid]";
import { getTheme } from "../../constants/muiTheme";
import GlobalContextProvider, {
  initContracts,
  initRegistry,
  useGlobal,
} from "../../context/globalContext";
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
  const { Moralis, isInitialized } = useMoralis();
  const { dispatch, state } = useGlobal();

  useEffect(() => {
    if (isInitialized) {
      initContracts(dispatch);
      initRegistry(dispatch, Moralis);
    }
  }, [isInitialized]);
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

export default Layout;
