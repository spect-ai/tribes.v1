import { Grid, Skeleton } from "@mui/material";
import React from "react";

type Props = {};

const SkeletonLoader = (props: Props) => {
  return (
    <Grid container spacing={2} sx={{ mt: 16 }}>
      <Grid item xs={3}>
        {Array(5)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={300}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(3)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={300}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(6)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={300}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={3}>
        {Array(1)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={300}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
    </Grid>
  );
};

export default SkeletonLoader;
