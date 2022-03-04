import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";
import Head from "next/head";

interface Props {}

const BoardPage: NextPage<Props> = (props: Props) => {
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <BoardsTemplate />
    </>
  );
};

export default BoardPage;
