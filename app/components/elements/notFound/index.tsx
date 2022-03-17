import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
  text: string;
};

const NotFound = ({ text }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Typography variant="h4" color="text.primary">
        {text}
      </Typography>
    </Box>
  );
};

export default NotFound;
