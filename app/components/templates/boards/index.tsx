import styled from "@emotion/styled";
import TaskBoard from "../../modules/taskBoard";

type Props = {};

const OuterDiv = styled.div`
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  width: 100%;
`;

const BoardsTemplate = (props: Props) => {
  return (
    <OuterDiv>
      <TaskBoard />
    </OuterDiv>
  );
};

export default BoardsTemplate;
