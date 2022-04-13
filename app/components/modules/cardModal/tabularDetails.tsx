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
    setTabIdx(newValue);
  };
  const [tabs, setTabs] = useState([
    "Applicants",
    "Submissions",
    "Activity",
  ] as string[]);
  const [tabIdx, setTabIdx] = useState(0);

  useEffect(() => {
    if (task.type === "Bounty") {
      setTabs(["Applicants", "Submissions", "Activity"]);
    } else if (task.type === "Task") {
      setTabs(["Comments", "Activity"]);
    }
    setTabIdx(0);
  }, [task]);

  return (
    <>
      <StyledTabs value={tabIdx} onChange={handleTabChange} sx={{}}>
        {tabs.map((tab, index) => {
          return <StyledTab key={index} label={tab} />;
        })}
      </StyledTabs>
      {tabs[tabIdx] === "Applicants" && (
        <Proposals task={task} setTask={setTask} />
      )}
      {tabs[tabIdx] === "Submissions" && (
        <Submission task={task} setTask={setTask} />
      )}
      {tabs[tabIdx] === "Activity" && <Activity task={task} />}
    </>
  );
};

export default TabularDetails;
