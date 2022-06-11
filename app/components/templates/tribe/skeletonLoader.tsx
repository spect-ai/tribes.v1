import styled from '@emotion/styled';
import { Box, Skeleton } from '@mui/material';
import React from 'react';

type Props = {};

const OuterDiv = styled.div`
  margin-left: 60px;
  margin-top: 60px;
  width: 100%;
`;

function SkeletonLoader(props: Props) {
  return (
    <OuterDiv>
      <Skeleton animation="wave" variant="text" width="30%" />
      <Skeleton animation="wave" variant="text" width="20%" />
      <Skeleton animation="wave" variant="text" width="70%" sx={{ mb: 8 }} />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="20%"
          height={120}
          sx={{ borderRadius: '10px', mr: 4 }}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="20%"
          height={120}
          sx={{ borderRadius: '10px' }}
        />
      </Box>
    </OuterDiv>
  );
}

export default SkeletonLoader;
