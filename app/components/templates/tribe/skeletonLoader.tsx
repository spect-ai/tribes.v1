import { Box, Skeleton } from "@mui/material";
import React from "react";

type Props = {};

const SkeletonLoader = (props: Props) => {
  return (
    <Box>
      <Skeleton animation="wave" variant="text" width={`30%`} />
      <Skeleton animation="wave" variant="text" width={`60%`} />
      <Box sx={{ my: 16 }} />
      <Skeleton animation="wave" variant="text" width={`10%`} />
      <Skeleton animation="wave" variant="text" width={`30%`} />
      <Skeleton animation="wave" variant="text" width={`20%`} />
      <Box sx={{ my: 16 }} />
      <Skeleton
        animation="wave"
        variant="rectangular"
        width={`20%`}
        height={100}
        sx={{ borderRadius: "10px" }}
      />
    </Box>
  );
};

export default SkeletonLoader;
