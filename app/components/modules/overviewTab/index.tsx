import React from "react";
import { Box, AvatarGroup, Avatar, Tooltip, Grid } from "@mui/material";
import styled from "@emotion/styled";
import { muiTheme } from "../../../constants/muiTheme";
import { useTribe } from "../../../../pages/tribe/[id]";
import { getMD5String } from "../../../utils/utils";
import Board from "../boardsTab";

const Overview = () => {
  const { tribe } = useTribe();
  return (
    <Wrapper>
      <Grid container>
        <Grid item xs={9}>
          <MainContainer>
            <Board />
          </MainContainer>
        </Grid>
        <Grid item xs={3}>
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
                    <Tooltip title={member.username} key={idx}>
                      <Avatar
                        alt=""
                        src={
                          member.profilePicture?._url !== null
                            ? member.profilePicture._url
                            : `https://www.gravatar.com/avatar/${getMD5String(
                                member.username
                              )}?d=identicon&s=32`
                        }
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </Box>
            </DescriptionContainer>
          </SideContainer>
        </Grid>
      </Grid>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  & > div {
    width: 100%;
    display: flex;
    padding: 0rem 1rem;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 1rem;
`;

const SideContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-left: 1px solid #282b2f;
  height: 100%;
  padding-left: 1rem;
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
