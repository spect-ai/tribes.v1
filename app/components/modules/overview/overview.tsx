import React from "react";
import { Box, Typography, AvatarGroup, Avatar, Tooltip } from "@mui/material";
import styled from "@emotion/styled";
import { muiTheme } from "../../../constants/muiTheme";
import { useTribe } from "../../../../pages/tribe/[id]";
import { getMD5String } from "../../../utils/utils";

const Overview = () => {
  const { tribe } = useTribe();
  console.log(tribe);

  return (
    <Wrapper>
      <MainContainer>
        <Box
          sx={{
            padding: 5,
            paddingRight: 0,
            paddingLeft: 0,
          }}
        >
          <Typography variant="h4">Mission</Typography>
          {tribe.mission}
        </Box>
      </MainContainer>
      <SideContainer>
        <DescriptionContainer>
          <Box
            sx={{
              margin: 1,
              mt: 4,
            }}
          >
            <Title>Contributors</Title>
            <AvatarGroup max={4} sx={{ width: "fit-content" }}>
              {tribe?.members?.map((member, idx) => (
                <Tooltip title={member.ethAddress} key={idx}>
                  <Avatar
                    alt=""
                    src={`https://www.gravatar.com/avatar/${getMD5String(
                      member.ethAddress
                    )}?d=identicon&s=32`}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        </DescriptionContainer>
      </SideContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;

  & > div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
    font-size: 16px;
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
  font-size: 20px;
  margin-bottom: 10;
  margin-top: 10;
  color: ${muiTheme.palette.text.secondary};
`;

const Value = styled.div`
  font-size: 16px;
  margin-bottom: 8;
  margin-top: 8;
  color: ${muiTheme.palette.text.primary};
`;

export default Overview;
