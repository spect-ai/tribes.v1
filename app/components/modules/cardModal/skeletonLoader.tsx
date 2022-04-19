import styled from '@emotion/styled';
import { Box, Grid, Skeleton } from '@mui/material';
import React from 'react';

type Props = {};

const SkeletonLoader = (props: Props) => {
  return (
    <SkeletonContainer>
      <Skeleton variant="rectangular" width={`60%`} height={40} />
      <Grid container sx={{ mt: 8 }}>
        <Grid item xs={9}>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`50%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`20%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`50%`}
              height={40}
            />
          </Box>
          <Box sx={{ mt: 8 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`50%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
          <Box sx={{ mt: 16 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`30%`}
              height={40}
            />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
          <Box sx={{ my: 4 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={`70%`}
              height={40}
            />
            <Skeleton
              variant="text"
              animation="wave"
              width={`40%`}
              height={40}
            />
          </Box>
        </Grid>
      </Grid>
    </SkeletonContainer>
  );
};

const SkeletonContainer = styled.div`
  width: 70rem;
  height: 35rem;
`;
export default SkeletonLoader;
