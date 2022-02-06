import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useMoralisCloudFunction } from "react-moralis";
import TribeTemplate from "../../app/components/modules/tribe";
import { Team } from "../../app/types";

interface Props {}

type Issue = {
  id: number;
  title: string;
};

interface TribeContextType {
  tab: number;
  setTab: (tab: number) => void;
  toDoTasks: Issue[];
  setToDoTasks: (tasks: Issue[]) => void;
  inProgressTasks: Issue[];
  setInProgressTasks: (tasks: Issue[]) => void;
  doneTasks: Issue[];
  setDoneTasks: (tasks: Issue[]) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  repo: string;
  setRepo: (repo: string) => void;
  tribe: Team;
  setTribe: (tribe: Team) => void;
  getTeam: () => void;
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

const TribePage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const { id } = router.query;
  const context = useProviderTribe();
  useEffect(() => {
    context.getTeam({
      onSuccess: (res: any) => {
        context.setTribe(res as Team);
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
  const [githubToken, setGithubToken] = useState("");
  const [repo, setRepo] = useState("");
  const [toDoTasks, setToDoTasks] = useState([] as any);
  const [inProgressTasks, setInProgressTasks] = useState([] as any);
  const [doneTasks, setDoneTasks] = useState([] as any);
  const [tribe, setTribe] = useState({} as Team);

  const { fetch: getTeam } = useMoralisCloudFunction(
    "getTeam",
    {
      limit: 1,
    },
    { autoFetch: false }
  );

  return {
    tab,
    setTab,
    toDoTasks,
    setToDoTasks,
    inProgressTasks,
    setInProgressTasks,
    doneTasks,
    setDoneTasks,
    githubToken,
    setGithubToken,
    repo,
    setRepo,
    tribe,
    setTribe,
    getTeam,
  };
}

export const useTribe = () => useContext(TribeContext);

export default TribePage;
