import styled from "@emotion/styled";
import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";

interface Props {}

const Container = styled.div`
  display: flex;
  max-width: 91.9%;
  overflow: hidden;
`;

const BoardPage: NextPage<Props> = (props: Props) => {
  return <BoardsTemplate />;
};

export default BoardPage;
