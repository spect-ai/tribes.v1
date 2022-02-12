import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import Script from "next/script";
import { useRouter } from "next/router";
import Layout from "../app/components/layouts";
import "../app/styles/globals.css";
import "../app/styles/mde.css";
import { muiTheme } from "../app/constants/muiTheme";
import { createTheme, ThemeProvider } from "@mui/material";

function MyApp({ Component, pageProps }: AppProps) {
  let theme = createTheme(muiTheme);
  const router = useRouter();
  const url = `localhost:3000/${router.route}`;
  return (
    <MoralisProvider
      appId={process.env.MORALIS_APPLICATION_ID || ""}
      serverUrl={process.env.MORALIS_SERVER_ID || ""}
      initializeOnMount={true}
    >
      <ThemeProvider theme={theme}>
        <Script
          src="https://kit.fontawesome.com/65590ff3eb.js"
          crossOrigin="anonymous"
        ></Script>
        <Layout>
          <Component {...pageProps} canonical={url} key={url} />
        </Layout>
      </ThemeProvider>
    </MoralisProvider>
  );
}

export default MyApp;
