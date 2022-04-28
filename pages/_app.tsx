import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React from 'react';
import { MoralisProvider } from 'react-moralis';
import Layout from '../app/components/layouts';
import GlobalContextProvider from '../app/context/globalContext';
import '../app/styles/globals.css';

console.log('starting _app', new Date());
function MyApp({ Component, pageProps }: AppProps) {
  // let theme = createTheme(classicDark);
  const router = useRouter();
  const url = `https://dev.spect.network/${router.route}`;

  return (
    <MoralisProvider
      appId={process.env.MORALIS_APPLICATION_ID || ''}
      serverUrl={process.env.MORALIS_SERVER_ID || ''}
    >
      <GlobalContextProvider>
        <Script
          src="https://kit.fontawesome.com/65590ff3eb.js"
          crossOrigin="anonymous"
        />
        <Layout>
          {/* <Component {...pageProps} canonical={url} key={url} /> */}
        </Layout>
      </GlobalContextProvider>
    </MoralisProvider>
  );
}

export default MyApp;
