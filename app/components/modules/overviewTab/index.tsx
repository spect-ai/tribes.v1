import React from 'react';
import {
  Box,
  AvatarGroup,
  Avatar,
  Tooltip,
  Grid,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import { useTribe } from '../../../../pages/tribe/[id]';
import Board from '../boardsTab';

const Overview = () => {
  const { tribe } = useTribe();
  return (
    <Wrapper>
      <Grid container>
        <Grid item xs={9}>
          <MainContainer>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mt: 2,
              }}
            >
              <Typography
                sx={{ fontSize: 16 }}
                color="rgba(255, 255, 255, 0.6)"
              >
                {tribe.description}
              </Typography>
            </Box>
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
                <Typography variant="h6" color="text.secondary">
                  Contributors
                </Typography>
                <AvatarGroup max={6} sx={{ width: 'fit-content' }}>
                  {tribe?.members?.map((memberId, idx) => (
                    <Tooltip
                      title={tribe.memberDetails[memberId].username}
                      key={idx}
                    >
                      <Avatar
                        alt=""
                        src={
                          tribe.memberDetails[memberId].profilePicture?._url ||
                          `https://cdn.discordapp.com/avatars/${tribe.memberDetails[memberId].discordId}/${tribe.memberDetails[memberId].avatar}.png`
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

// color: ${classicDark.palette.text.secondary};

const Value = styled.div`
  font-size: 16px;
  margin-bottom: 8;
  margin-top: 8;
`;

export default Overview;
