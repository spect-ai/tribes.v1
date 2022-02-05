import { NextPage } from "next";
import Head from "next/head";
import { createContext, useContext, useState } from "react";
import TribeTemplate from "../../app/components/templates/tribe";

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
}

export const TribeContext = createContext<TribeContextType>(
  {} as TribeContextType
);

const TribePage: NextPage<Props> = (props: Props) => {
  const context = useProviderTribe();
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
  };
}

export const useTribe = () => useContext(TribeContext);

export default TribePage;
