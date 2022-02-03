import { NextPage } from "next";
import Head from "next/head";
import { createContext, useContext, useState } from "react";
import TribeTemplate from "../../app/components/templates/tribe";

interface Props {}

interface TribeContextType {
  tab: number;
  setTab: (tab: number) => void;
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

const TribePage: NextPage<Props> = (props: Props) => {
  const context = useProviderTribe();
  return (
    <>
      <Head>
        <title>Spect.network Gig</title>
        <meta name="description" content={`Decentralized gig economy`} />
        <link rel="icon" href="/logo2.svg" />
      </Head>
      <TribeContext.Provider value={context}>
        <TribeTemplate />
      </TribeContext.Provider>
    </>
  );
};

function useProviderTribe() {
  const [tab, setTab] = useState(0);

  return {
    tab,
    setTab,
  };
}

export const useTribe = () => useContext(TribeContext);

export default TribePage;
