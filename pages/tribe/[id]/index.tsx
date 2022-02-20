import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import {
  MoralisCloudFunctionParameters,
  useMoralis,
  useMoralisCloudFunction,
} from "react-moralis";
import { ResolveCallOptions } from "react-moralis/lib/hooks/internal/_useResolveAsyncCall";
import { getTaskEpoch } from "../../../app/adapters/moralis";
import TribeTemplate from "../../../app/components/templates/tribe";
import { Epoch, Task, Team } from "../../../app/types";

interface Props {}

type Issue = {
  id: number;
  title?: string;
  issueLink: string;
};

interface TribeContextType {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  tribe: Team;
  setTribe: (tribe: Team) => void;
  getTeam: Function;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

const TribePage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const { id } = router.query;
  const context = useProviderTribe();
  useEffect(() => {
    context.setLoading(true);
    context.getTeam({
      onSuccess: (res: any) => {
        console.log(res);
        context.setTribe(res as Team);
        context.setLoading(false);
      },
      params: {
        teamId: id,
      },
    });
  }, [id]);

  return (
    <>
      <Head>
        <title>Spect.network Tribe</title>
        <meta name="description" content={`Decentralized gig economy`} />
        <link rel="icon" href="public/logo2.svg" />
      </Head>
      <TribeContext.Provider value={context}>
        <TribeTemplate />
      </TribeContext.Provider>
    </>
  );
};

function useProviderTribe() {
  const [tab, setTab] = useState(0);

  const [tribe, setTribe] = useState({} as Team);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const { fetch: getTeam } = useMoralisCloudFunction(
    "getTeam",
    {
      limit: 1,
    },
    { autoFetch: false }
  );

  return {
    tab,
    handleTabChange,
    tribe,
    setTribe,
    getTeam,
    loading,
    setLoading,
  };
}

export const useTribe = () => useContext(TribeContext);

export default TribePage;
