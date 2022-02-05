import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import Board from "../../modules/board";
import Contributor from "../../modules/contributors/index"
import TribeHeading from "../../modules/tribeHeading";
import Settings from '../../modules/settings';
import Overview from "../overview/overview";

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
      {tab == 1 && <Contributor/>}
      {tab == 2 && <Board />}
      {tab == 3 && <Settings/>}
    </OuterDiv>
  );
};

export default TribeTemplate;
