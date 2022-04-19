import styled from '@emotion/styled';
import { Box, Fade, Grow } from '@mui/material';
import React from 'react';
import { useTribe } from '../../../../pages/tribe/[id]';
import Overview from '../../modules/overviewTab';
import Settings from '../../modules/settingsTab';
import TribeHeading from '../../modules/tribeHeading';
import TribeMembers from '../../modules/tribeMembers';
import SkeletonLoader from './skeletonLoader';

type Props = {};

const TabContainer = styled.div`
  padding: 0;
`;

const OuterDiv = styled.div`
  margin-left: 1rem;
  margin-right: 1rem;
  width: 100%;
`;
function TribeTemplate(props: Props) {
  const { tab, loading } = useTribe();
  return (
    <OuterDiv>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <Fade in={!loading} timeout={500}>
          <Box>
            <TribeHeading />
            {tab === 0 && (
              <Grow timeout={500} in={tab === 0}>
                <TabContainer>
                  <Overview />
                </TabContainer>
              </Grow>
            )}
            {tab === 1 && (
              <Grow timeout={500} in={tab === 1}>
                <TabContainer>
                  <TribeMembers />
                </TabContainer>
              </Grow>
            )}
            {tab === 2 && (
              <Grow timeout={500} in={tab === 2}>
                <TabContainer>
                  <Settings />
                </TabContainer>
              </Grow>
            )}
          </Box>
        </Fade>
      )}
    </OuterDiv>
  );
}

export default TribeTemplate;
