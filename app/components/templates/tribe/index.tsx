import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import Board from "../../modules/boardsTab";
import Contributor from "../../modules/contributorsTab/index";
import TribeHeading from "../../modules/tribeHeading";
import Settings from "../../modules/settingsTab";
import Overview from "../../modules/overviewTab";

type Props = {};

const OuterDiv = styled.div`
  margin-left: 4rem;
  margin-right: 4rem;
`;

const TribeTemplate = (props: Props) => {
  const { tab } = useTribe();
  return (
    <OuterDiv>
      <TribeHeading />
      {tab == 0 && <Overview />}
      {tab == 1 && <Contributor />}
      {tab == 2 && <Board />}
      {tab == 3 && <Settings />}
    </OuterDiv>
  );
};

export default TribeTemplate;
