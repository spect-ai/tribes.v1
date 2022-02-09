import styled from "@emotion/styled";
import React from "react";
import TaskBoard from "../../modules/taskBoard";

type Props = {};

const OuterDiv = styled.div`
  margin-left: 4rem;
  margin-right: 4rem;
`;

const BoardsTemplate = (props: Props) => {
  return (
    <OuterDiv>
      <TaskBoard />
    </OuterDiv>
  );
};

export default BoardsTemplate;
