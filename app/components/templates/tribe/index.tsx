import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import TribeHeading from "../../modules/tribeHeading";
import Settings from "../../modules/settingsTab";
import Overview from "../../modules/overviewTab";
import SkeletonLoader from "./skeletonLoader";
import { Box, Fade } from "@mui/material";
type Props = {};

const OuterDiv = styled.div`
  margin-left: 1rem;
  margin-right: 1rem;
`;

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
            {tab == 0 && <Overview />}
            {tab == 2 && <Settings />}
          </Box>
        </Fade>
      )}
    </OuterDiv>
  );
};

export default TribeTemplate;
