import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import ContributorsTableComponent from "./ContributorsTableComponent";
import { muiTheme } from "../../../constants/muiTheme";
import { Epoch, Team } from "../../../types/index";
import { useMoralis } from "react-moralis";
import { getEpoch } from "../../../adapters/moralis";

interface Props {}

const Contributor = (props: Props) => {
  const { isAuthenticated, Moralis, user } = useMoralis();
  const [epoch, setEpoch] = useState<Epoch>({} as Epoch);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [voteAllocation, setVoteAllocation] = useState({});

  useEffect(() => {
    if (Object.keys(epoch).length === 0) {
      let memberStats;
      // TODODO
      getEpoch(Moralis, "Cj4mtnwlNEDxaq3b9TFZ0TV0").then((res: Epoch) => {
        console.log(res);
        setEpoch(res);
        memberStats = res.memberStats.filter((m: any) => m.ethAddress.toLowerCase() === user?.get("ethAddress"));
        memberStats.length > 0 ? setRemainingVotes(memberStats[0]?.votesRemaining) : setRemainingVotes(0);
        memberStats.length > 0 ? setVoteAllocation(memberStats[0]?.votesAllocated) : null;
      }, []);
    }
  });
  return (
    <Wrapper>
      <MainContainer>
        <ContributorsTableComponent
          epoch={epoch}
          setRemainingVotes={setRemainingVotes}
          remainingVotes={remainingVotes}
          setVoteAllocation={setVoteAllocation}
          voteAllocation={voteAllocation}
        />
      </MainContainer>
      <SideContainer>
        <DescriptionContainer>
          <Title>Remaining Votes</Title>
          <Value>{remainingVotes}</Value>
        </DescriptionContainer>
        <DescriptionContainer>
          <Title>Remaining time</Title>
          <Value>2 hours left</Value>
        </DescriptionContainer>
        <DescriptionContainer>
          <Title>Epoch Budget</Title>
          <Value>${epoch.budget}</Value>
        </DescriptionContainer>
      </SideContainer>
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
