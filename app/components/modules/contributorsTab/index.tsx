import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import ContributorsTableComponent from "./ContributorsTableComponent";
import { muiTheme } from "../../../constants/muiTheme";
import { Epoch, Team } from "../../../types/index";
import { useMoralis } from "react-moralis";
import { endEpoch, getEpoch, getTeam, giftContributors } from "../../../adapters/moralis";
import PaidIcon from "@mui/icons-material/Paid";
import { massPayment } from "../../../adapters/gnosis";
import { distributeTokensForContribution } from "../../../adapters/contract";
import { useTribe } from "../../../../pages/tribe/[id]";
import { formatTimeLeft } from "../../../utils/utils";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import { PrimaryButton } from "../../elements/styledComponents";

interface Props {}

const Contributor = (props: Props) => {
  const { isAuthenticated, Moralis, user } = useMoralis();
  const [team, setTeam] = useState<Team>({} as Team);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [voteAllocation, setVoteAllocation] = useState({});
  const { tribe } = useTribe();
  console.log(tribe);
  return (
    <Wrapper>
      <MainContainer>
        <ContributorsTableComponent tribe={tribe} />
      </MainContainer>
    </Wrapper>
  );
};

export default Contributor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  & > div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
  }
`;

const MainContainer = styled.div`
  flex: 4;
  height: 400px;
`;

const SideContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 10px;
  border-left: 1px solid #282b2f;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: flex-start;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-self: flex-start;
  flex-direction: column;
  padding-bottom: 16px;
`;

const Title = styled.div`
  font-size: 12px;
  margin-bottom: 8;
  margin-top: 8;
  color: ${muiTheme.palette.text.secondary};
`;

const Value = styled.div`
  font-size: 16px;
  margin-bottom: 8;
  margin-top: 8;
  color: ${muiTheme.palette.text.primary};
`;
