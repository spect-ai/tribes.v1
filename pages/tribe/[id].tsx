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
import { getTaskEpoch } from "../../app/adapters/moralis";
import TribeTemplate from "../../app/components/modules/tribe";
import { Epoch, Task, Team } from "../../app/types";

interface Props {}

type Issue = {
  id: number;
  title: string;
  issueLink: string;
};

interface TribeContextType {
  tab: number;
  setTab: (tab: number) => void;
  toDoTasks: Task[];
  setToDoTasks: (tasks: Task[]) => void;
  inProgressTasks: Task[];
  setInProgressTasks: (tasks: Task[]) => void;
  doneTasks: Task[];
  setDoneTasks: (tasks: Task[]) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  repo: string;
  setRepo: (repo: string) => void;
  tribe: Team;
  setTribe: (tribe: Team) => void;
  getTeam: Function;
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

const TribePage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const { id } = router.query;
  const { Moralis, user } = useMoralis();
  const context = useProviderTribe();
  useEffect(() => {
    console.log(user?.get("ethAddress"));
    context.getTeam({
      onSuccess: (res: any) => {
        context.setTribe(res as Team);
        console.log(res);
        getTaskEpoch(Moralis, (res as Team).latestTaskEpoch).then(
          (res: any) => {
            console.log(res);
            if (res.length > 0) {
              const tasks = (res as Epoch[])[0].tasks;
              context.setToDoTasks(
                tasks.filter((task) => {
                  return task.status === 100;
                })
              );
              context.setInProgressTasks(
                tasks.filter((task) => {
                  return task.status === 101;
                })
              );
              context.setDoneTasks(
                tasks.filter((task) => {
                  return task.status === 102;
                })
              );
            }
          }
        );
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
