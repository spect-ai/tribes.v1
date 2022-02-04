import { NextPage } from "next";
import Head from "next/head";
import { createContext, useContext, useState } from "react";
import TribeTemplate from "../../app/components/templates/tribe";

interface Props {}

interface TribeContextType {
  tab: number;
  setTab: (tab: number) => void;
  toDoTasks: Array<{ title: string }>;
  setToDoTasks: (tasks: Array<{ title: string }>) => void;
  inProgressTasks: Array<{ title: string }>;
  setInProgressTasks: (tasks: Array<{ title: string }>) => void;
  doneTasks: Array<{ title: string }>;
  setDoneTasks: (tasks: Array<{ title: string }>) => void;
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
  const [toDoTasks, setToDoTasks] = useState([
    { title: "Update user stake after txn" },
    { title: "There is always a lag after every button click" },
    {
      title:
        "Notifications show up again after clearing notifs, disconnecting wallet and.....",
    },
  ]);
  const [inProgressTasks, setInProgressTasks] = useState([
    { title: "Wallet issue, address mismatch user undefined" },
    {
      title:
        "Review not reflecting in profile (Submission Page redesign should....",
    },
  ]);
  const [doneTasks, setDoneTasks] = useState([
    {
      title:
        "Clicking logout doesnt log me out, instead asks me to connect wallet immediately",
    },
  ]);

  return {
    tab,
    setTab,
    toDoTasks,
    setToDoTasks,
    inProgressTasks,
    setInProgressTasks,
    doneTasks,
    setDoneTasks,
  };
}

export const useTribe = () => useContext(TribeContext);

export default TribePage;
