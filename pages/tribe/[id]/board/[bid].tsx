import styled from "@emotion/styled";
import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";

interface Props {}

const BoardPage: NextPage<Props> = (props: Props) => {
  return <BoardsTemplate />;
};

export default BoardPage;
