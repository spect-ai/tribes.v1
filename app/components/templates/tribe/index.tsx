import styled from "@emotion/styled";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import TribeHeading from "../../modules/tribeHeading";

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
      {tab == 0 && <div>Overview</div>}
      {tab == 1 && <div>Contributors</div>}
      {tab == 2 && <div>Board</div>}
      {tab == 3 && <div>Settings</div>}
    </OuterDiv>
  );
};

export default TribeTemplate;
