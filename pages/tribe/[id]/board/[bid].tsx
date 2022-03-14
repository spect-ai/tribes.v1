import { NextPage } from "next";
import BoardsTemplate from "../../../../app/components/templates/boards";
import Head from "next/head";
import styled from "@emotion/styled";
import Sidebar from "../../../../app/components/modules/sidebar";
import { createTheme, Theme, ThemeProvider, useTheme } from "@mui/material";
import {
  classicDark,
  warmPurple,
  oceanBlue,
} from "../../../../app/constants/muiTheme";

interface Props {}

const BoardPage: NextPage<Props> = (props: Props) => {
  const { palette } = useTheme();
  const theme = createTheme(oceanBlue);
  return (
    <>
      <Head>
        <title>Spect.Tribes</title>
        <meta name="description" content="Manage DAO with ease" />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <ThemeProvider theme={theme}>
        <PageContainer theme={theme}>
          <Sidebar />
          <BoardsTemplate />
        </PageContainer>
      </ThemeProvider>
    </>
  );
};

export const PageContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette.background.default};
`;

export default BoardPage;
