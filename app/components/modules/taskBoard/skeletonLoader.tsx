import { Grid, Skeleton } from "@mui/material";
import React from "react";

type Props = {};

const SkeletonLoader = (props: Props) => {
  return (
    <Grid container spacing={2} columns={10}>
      <Grid item xs={2}>
        {Array(5)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={`100%`}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={2}>
        {Array(3)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={`100%`}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={2}>
        {Array(6)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={`100%`}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={2}>
        {Array(1)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={`100%`}
              height={100}
              variant="rectangular"
              animation="wave"
              sx={{ mt: 2, borderRadius: "0.5rem" }}
              key={index}
            />
          ))}
      </Grid>
      <Grid item xs={2}>
        {Array(2)
          .fill("")
          .map((_, index) => (
            <Skeleton
              width={`100%`}
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
