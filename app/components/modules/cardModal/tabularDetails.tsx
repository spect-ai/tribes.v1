import React, { useEffect, useState } from "react";
import { useGlobal } from "../../../context/globalContext";
import { Task } from "../../../types";
import { StyledTab, StyledTabs } from "../../elements/styledComponents";
import Proposals from "./proposals";
import Submission from "./submission";
import Activity from "./activity";
import { useMoralis } from "react-moralis";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const tabMap: any = {
  Proposals: 0,
  Submission: 1,
  Activity: 2,
};

const TabularDetails = ({ task, setTask }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const [tabs, setTabs] = useState([
    "Applicants",
    "Submissions",
    "Activity",
  ] as string[]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    /*
    var temp = [];
    if (task.type === "Bounty") {
      temp.push("Proposals");
    }
    if (task.access.creator || task.access.creator || task.access.reviewer) {
      temp.push("Submissions");
    }
    temp.push("Activity");
    setTabs(temp);*/
  }, [task]);

  return (
    <>
      <StyledTabs value={tab} onChange={handleTabChange} sx={{}}>
        {tabs.map((tab, index) => {
          console.log(tab);
          return <StyledTab key={index} label={tab} />;
        })}
      </StyledTabs>
      {tab === 0 && <Proposals task={task} setTask={setTask} />}
      {tab === 1 && <Submission task={task} setTask={setTask} />}
      {tab === 2 && <Activity task={task} setTask={setTask} />}
    </>
  );
};

export default TabularDetails;
