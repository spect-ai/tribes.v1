import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
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
    <OuterDiv>
      <Main>{children}</Main>
      {/* <Footer /> */}
    </OuterDiv>
  );
};

export default Layout;
