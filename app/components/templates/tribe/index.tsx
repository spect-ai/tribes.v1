import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import TribeHeading from "../../modules/tribeHeading";
import Settings from "../../modules/settingsTab";
import Overview from "../../modules/overviewTab";
import SkeletonLoader from "./skeletonLoader";
import { Box, Fade, Grow } from "@mui/material";
type Props = {};

const TribeTemplate = (props: Props) => {
  const { tab, loading } = useTribe();
  return (
    <OuterDiv>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <Fade in={!loading} timeout={500}>
          <Box>
            <TribeHeading />
            {tab == 0 && (
              <Grow timeout={500} in={tab == 0}>
                <TabContainer>
                  <Overview />
                </TabContainer>
              </Grow>
            )}
            {tab == 1 && (
              <Grow timeout={500} in={tab == 1}>
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
};

const TabContainer = styled.div`
  padding: 0;
`;

const OuterDiv = styled.div`
  margin-left: 1rem;
  margin-right: 1rem;
  width: 100%;
`;

export default TribeTemplate;
