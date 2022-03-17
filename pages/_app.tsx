import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import Script from "next/script";
import { useRouter } from "next/router";
import Layout from "../app/components/layouts";
import "../app/styles/globals.css";
import "../app/styles/mde.css";
import GlobalContextProvider from "../app/context/globalContext";

function MyApp({ Component, pageProps }: AppProps) {
  // let theme = createTheme(classicDark);
  const router = useRouter();
  const url = `localhost:3000/${router.route}`;

  return (
    <MoralisProvider
      appId={process.env.MORALIS_APPLICATION_ID || ""}
      serverUrl={process.env.MORALIS_SERVER_ID || ""}
    >
      <GlobalContextProvider>
        <Script
          src="https://kit.fontawesome.com/65590ff3eb.js"
          crossOrigin="anonymous"
        />
        <Layout>
          <Component {...pageProps} canonical={url} key={url} />
        </Layout>
      </GlobalContextProvider>
    </MoralisProvider>
  );
}

export default MyApp;
