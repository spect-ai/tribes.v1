import styled from '@emotion/styled';
import { createTheme, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { PageContainer } from '../../../pages/tribe/[id]/space/[bid]';
import { getTheme } from '../../constants/muiTheme';
import {
  initContracts,
  initRegistry,
  useGlobal,
} from '../../context/globalContext';
import { useMoralisFunction } from '../../hooks/useMoralisFunction';

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

const Main = styled.main`
  flex-grow: 1;
`;

function Layout({ children }: Props) {
  const { Moralis, isInitialized, user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const { dispatch } = useGlobal();

  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      initContracts(dispatch);
      initRegistry(dispatch, Moralis);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (router.query.code) {
      console.log('linking user');
      runMoralisFunction('linkDiscordUser', { code: router.query.code }).then(
        (res) => {
          console.log(res);
          // updateUser(dispatch, res);
          user?.fetch().then((res2) => {
            console.log(res2);
          });
          router.push('/');
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
          <Typography sx={{ color: '#eaeaea', margin: 'auto' }}>
            Mobile Not Supported yet!
          </Typography>
        </PageContainer>
      </MobileDiv>
    </>
  );
}

export default Layout;
