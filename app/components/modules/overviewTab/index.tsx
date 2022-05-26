import styled from '@emotion/styled';
import {
  Avatar,
  AvatarGroup,
  Box,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTribe } from '../../../../pages/tribe/[id]';
import MemberAvatarGroup from '../../elements/memberAvatarGroup';
import Board from '../boardsTab';

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

function Overview() {
  const { tribe } = useTribe();
  return (
    <Wrapper data-testid="overviewContainer">
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
                data-testid="tribeDescription"
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
                <MemberAvatarGroup
                  memberIds={tribe?.members}
                  memberDetails={tribe.memberDetails}
                  maxAvatars={6}
                  testid="avatarGroup"
                  avatarGroupsx={{
                    '& .MuiAvatar-root': {
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: 15,
                    },
                  }}
                />
              </Box>
            </DescriptionContainer>
          </SideContainer>
        </Grid>
      </Grid>
    </Wrapper>
  );
}

export default Overview;
