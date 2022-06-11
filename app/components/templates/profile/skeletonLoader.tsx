import { Box, Skeleton } from '@mui/material';
import React from 'react';

type Props = {};

function SkeletonLoader(props: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'start',
        width: '100%',
        mb: 8,
      }}
    >
      <Skeleton animation="wave" variant="text" width="100%" height="18rem" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          alignItems: 'start',
          mx: 32,
          width: '80%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '80%',
          }}
        >
          <Skeleton
            animation="wave"
            variant="circular"
            width="8rem"
            height="8rem"
            sx={{
              marginTop: '-6rem',
            }}
          />
          <Skeleton
            animation="wave"
            variant="text"
            width="8rem"
            height="2rem"
            sx={{
              marginTop: '-6rem',
              marginLeft: '1rem',
            }}
          />

          <Box sx={{ flex: '1 1 auto' }} />
          <Skeleton
            animation="wave"
            variant="text"
            width="8rem"
            height="2rem"
            sx={{
              marginTop: '-6rem',
              marginLeft: '1rem',
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          mx: 32,
          mt: 4,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            mt: 4,
            width: '100%',
          }}
        >
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="8rem"
            height="2rem"
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="8rem"
            height="2rem"
            sx={{ ml: 2 }}
          />
        </Box>
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="55%"
          height="8rem"
          sx={{ mt: 2 }}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="55%"
          height="8rem"
          sx={{ mt: 2 }}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="55%"
          height="8rem"
          sx={{ mt: 2 }}
        />
      </Box>
    </Box>
  );
}

export default SkeletonLoader;
