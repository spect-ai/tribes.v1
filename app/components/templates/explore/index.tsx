import { Box, Grid } from '@mui/material';
import React from 'react';
import { useExplore } from '../../../../pages';
import { Team } from '../../../types';
import DAOCard from '../../elements/daoCard';

type Props = {};

function ExploreTemplate(props: Props) {
  const { publicTribes } = useExplore();
  return (
    <Box
      data-testid="explore-template-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        mb: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'start',
          mt: 4,
          width: '95%',
        }}
      >
        <Grid container spacing={8} columns={15} data-testid="explore-grid">
          {publicTribes.map((tribe: Team) => (
            <Grid item xs={3} key={tribe.teamId}>
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
    </Box>
  );
}

export default ExploreTemplate;
