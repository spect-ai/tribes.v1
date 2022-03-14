import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";
import Head from "next/head";
import styled from "@emotion/styled";
import Sidebar from "../../../../app/components/modules/sidebar";

interface Props {}

const BoardPage: NextPage<Props> = (props: Props) => {
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <PageContainer>
        <Sidebar />
        <BoardsTemplate />
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
`;

export default BoardPage;
