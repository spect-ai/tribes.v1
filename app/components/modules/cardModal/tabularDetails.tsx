import React, { useEffect, useState } from "react";
import { useGlobal } from "../../../context/globalContext";
import { Task } from "../../../types";
import { StyledTab, StyledTabs } from "../../elements/styledComponents";
import ProposalsStewardView from "./content/proposalsStewardView";
import ProposalApplicantdView from "./content/proposalApplicantView";
import Apply from "./buttons/apply";
import Submission from "./content/submission";
import Activity from "./content/activity";
import { useMoralis } from "react-moralis";
import Comments from "./content/comments";
import { useCardDynamism } from "../../../hooks/useCardDynamism";
import { Box } from "@mui/material";
//import Activity from "./content/act";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const TabularDetails = ({ task, setTask }: Props) => {
  const {
    state: { registry },
  } = useGlobal();

  const { tabs, setTabs, handleTabChange, tabIdx } = useCardDynamism(task);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Apply task={task} setTask={setTask} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          width: "100%",
        }}
      >
        <StyledTabs value={tabIdx} onChange={handleTabChange} sx={{}}>
          {tabs.map((tab, index) => {
            return <StyledTab key={index} label={tab} />;
          })}
        </StyledTabs>
        {tabs[tabIdx] === "Applicants" && (
          <ProposalsStewardView task={task} setTask={setTask} />
        )}
        {tabs[tabIdx] === "Application" && (
          <ProposalApplicantdView task={task} setTask={setTask} />
        )}
        {tabs[tabIdx] === "Submissions" && (
          <Submission task={task} setTask={setTask} />
        )}
        {tabs[tabIdx] === "Activity" && <Activity task={task} />}
        {tabs[tabIdx] === "Comments" && (
          <Comments task={task} setTask={setTask} />
        )}
      </Box>
    </>
  );
};

export default TabularDetails;
