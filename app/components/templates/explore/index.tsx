import styled from '@emotion/styled';
import { Box, Grid } from '@mui/material';
import React from 'react';
import { useExplore } from '../../../../pages';
import { Team } from '../../../types';
import DAOCard from '../../elements/daoCard';

type Props = {};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: '100%';
  overflow-y: none;
  margin-bottom: 8px;
  margin-left: 60px;
  margin-top: 60px;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

function ExploreTemplate(props: Props) {
  const { publicTribes } = useExplore();
  return (
    <Container data-testid="explore-template-container">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'start',
          mt: 4,
          width: '95%',
        }}
      >
        <Grid
          container
          columns={{ xs: 15, sm: 14, md: 15, lg: 15 }}
          data-testid="explore-grid"
          rowSpacing={4}
          columnSpacing={{ xs: 1, sm: 2, md: 6, lg: 8, xl: 8 }}
        >
          {publicTribes.map((tribe: Team) => (
            <Grid item lg={3} md={5} sm={7} xs={15} key={tribe.teamId || 'id'}>
              <DAOCard
                data-testid={`tribe-card-${tribe.teamId}`}
                image={tribe.logo}
                title={tribe.name}
                members={tribe.members?.length}
                teamId={tribe.teamId}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default ExploreTemplate;
