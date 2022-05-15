import styled from '@emotion/styled';
import { Box, Grid, Skeleton } from '@mui/material';
import React from 'react';

type Props = {};

const SkeletonContainer = styled.div`
  width: 70rem;
  height: 35rem;
`;

function SkeletonLoader(props: Props) {
  return (
    <SkeletonContainer>
      <Skeleton variant="text" width="60%" height={40} />
      <Grid container sx={{ mt: 8 }}>
        <Grid item xs={9}>
          <Box sx={{ my: 4, display: 'flex' }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 8 }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 6 }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 6 }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 6 }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 6 }}
            />
          </Box>
          <Box sx={{ my: 4 }}>
            <Skeleton variant="text" animation="wave" width="70%" height={40} />
            <Skeleton variant="text" animation="wave" width="40%" height={40} />
            <Skeleton variant="text" animation="wave" width="50%" height={40} />
            <Skeleton variant="text" animation="wave" width="20%" height={40} />
            <Skeleton variant="text" animation="wave" width="50%" height={40} />
          </Box>
          <Box sx={{ mt: 16, display: 'flex' }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 8 }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="15%"
              height={30}
              sx={{ mr: 8 }}
            />
          </Box>
        </Grid>
      </Grid>
    </SkeletonContainer>
  );
}

export default SkeletonLoader;
