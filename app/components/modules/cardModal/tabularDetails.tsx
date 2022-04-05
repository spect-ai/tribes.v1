import styled from "@emotion/styled";
import {
  Autocomplete,
  Popover,
  TextField,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import React, { useState, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { BoardData, Chain, Registry, Task, Token } from "../../../types";
import {
  PrimaryButton,
  CardButton,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import { PopoverContainer } from "./styles";
import { useGlobal } from "../../../context/globalContext";

type Props = {
  task: Task;
  showTabs: Array<number>;
};

const tabs = ["Proposals", "Submission", "Activity"];

const TabularDetails = ({ task, showTabs }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const [tab, setTab] = useState(showTabs[0]);
  return (
    <>
      <StyledTabs value={tab} onChange={handleTabChange} sx={{}}>
        {tabs.map((tab, index) => {
          console.log(tab);
          return (
            showTabs.includes(index) && <StyledTab key={index} label={tab} />
          );
        })}
      </StyledTabs>
    </>
  );
};

export default TabularDetails;
