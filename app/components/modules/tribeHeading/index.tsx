import { Avatar, Fade, styled, Tab, Tabs, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";

const HeadingAvatar = styled(Avatar)(({ theme }) => ({
  width: "6rem",
  height: "6rem",
  objectFit: "cover",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontSize: "1.2rem",
  marginRight: 25,
}));
type Props = {};

const TribeHeading = (props: Props) => {
  const { setTab, tab } = useTribe();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <div>
      <Box
        sx={{ display: "flex", flexDirection: "row", width: "100%", margin: 1 }}
      >
        <Box
          sx={{ display: "flex", flexDirection: "row", width: "75%", pt: 4 }}
        >
          <div style={{ marginRight: 8 }}>
            <Link href={`/profile/`} passHref>
              <HeadingAvatar alt="Username" />
            </Link>
          </div>
          <Typography variant="h4">Dao Name</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs value={tab} onChange={handleChange}>
          <StyledTab label="Overview" value={0} />
          <StyledTab label="Contributors" value={1} />
          <StyledTab label="Board" value={2} />
          <StyledTab label="Settings" value={3} />
        </Tabs>
      </Box>
    </div>
  );
};

export default TribeHeading;
