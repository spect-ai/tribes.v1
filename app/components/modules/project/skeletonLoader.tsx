/* eslint-disable react/no-array-index-key */
import { Grid, Skeleton } from '@mui/material';
import React from 'react';

type Props = {};

function ProjectSkeletonLoader(props: Props) {
  return (
    <Grid container spacing={2} columns={12} sx={{ padding: 8, mt: 4, ml: 16 }}>
      <Grid item xs={3}>
        {Array(5)
          .fill('')
          .map((_, index) => (
            <Skeleton
              width="100%"
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: '0.5rem' }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(3)
          .fill('')
          .map((_, index) => (
            <Skeleton
              width="100%"
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: '0.5rem' }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(6)
          .fill('')
          .map((_, index) => (
            <Skeleton
              width="100%"
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: '0.5rem' }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(1)
          .fill('')
          .map((_, index) => (
            <Skeleton
              width="100%"
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: '0.5rem' }}
              key={index}
            />
          ))}
      </Grid>
    </Grid>
  );
}

export default ProjectSkeletonLoader;
