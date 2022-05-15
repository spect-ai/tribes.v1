import React from 'react';
import { Grid, Typography } from '@mui/material';

import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import CreateEpoch from './createEpochModal';

type Props = {};

function ZeroEpochs(props: Props) {
  const { space } = useSpace();
  const { user } = useMoralis();

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '50vh' }}
    >
      <Grid item xs={3}>
        <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
          There are no epochs in this space
        </Typography>{' '}
        {user && space.roles[user?.id] === 3 && <CreateEpoch />}
      </Grid>
    </Grid>
  );
}

export default ZeroEpochs;
