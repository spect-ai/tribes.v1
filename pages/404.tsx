import { Box, createTheme, Typography } from "@mui/material";
import { PrimaryButton } from "../app/components/elements/styledComponents";
import { getTheme } from "../app/constants/muiTheme";
import { PageContainer } from "./tribe/[id]/space/[bid]";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  return (
    <PageContainer theme={createTheme(getTheme(0))}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Typography variant="h3" sx={{ color: "#eaeaea" }}>
          404 Page not found fren :(
        </Typography>
      </Box>
    </PageContainer>
  );
}
