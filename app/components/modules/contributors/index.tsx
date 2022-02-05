import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import ContributorsTableComponent from "./ContributorsTableComponent";
import { muiTheme } from "../../../constants/muiTheme";
import { Epoch, Team } from "../../../types/index";
import { useMoralis } from "react-moralis";
import { getEpoch } from "../../../adapters/moralis";
import { PrimaryButton } from "../epochModal";
import PaidIcon from "@mui/icons-material/Paid";
import { massPayment } from "../../../adapters/gnosis";
import { useTribe } from "../../../../pages/tribe/[id]";

interface Props {}

const Contributor = (props: Props) => {
  const { isAuthenticated, Moralis } = useMoralis();
  const [epoch, setEpoch] = useState<Epoch>({} as Epoch);
  const { tribe } = useTribe();
  const { user } = useMoralis();

  useEffect(() => {
    if (Object.keys(epoch).length === 0) {
      getEpoch(Moralis, "MkKNkxfyi1EHnFAmtnws3rw6").then((res: Epoch) => {
        console.log(res);
        setEpoch(res);
      }, []);
    }
  });
  return (
    <Wrapper>
      <MainContainer>
        <ContributorsTableComponent epoch={epoch} />
      </MainContainer>
      <SideContainer>
        <PrimaryButton
          variant="outlined"
          endIcon={<PaidIcon />}
          fullWidth
          sx={{ mb: 2 }}
          onClick={() =>
            massPayment(tribe.treasuryAddress, user?.get("ethAddress"))
          }
        >
          Pay
        </PrimaryButton>
        <DescriptionContainer>
          <Title>Remaining Votes</Title>
          <Value>29</Value>
        </DescriptionContainer>
        <DescriptionContainer>
          <Title>Budget</Title>
          <Value>$ 500</Value>
        </DescriptionContainer>
        <DescriptionContainer>
          <Title>Total Votes Allocated</Title>
          <Value>100</Value>
        </DescriptionContainer>
        <DescriptionContainer>
          <Title>Remaining time</Title>
          <Value>2 hours left</Value>
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
