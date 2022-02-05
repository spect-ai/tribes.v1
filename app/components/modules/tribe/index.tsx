import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import Board from "../board";
import Contributor from "../contributors/index"
import TribeHeading from "../tribeHeading";
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
      {tab == 3 && <div>Settings</div>}
    </OuterDiv>
  );
};

export default TribeTemplate;
