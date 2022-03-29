import { Box, Grid } from "@mui/material";
import React from "react";
import { useExplore } from "../../../../pages";
import { Team } from "../../../types";
import DAOCard from "../../elements/daoCard";
import { StyledTab, StyledTabs } from "../../elements/styledComponents";

type Props = {};

const ExploreTemplate = (props: Props) => {
  const { publicTribes, tab, setTab } = useExplore();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
          mt: 4,
          width: "95%",
        }}
      >
        <Grid container spacing={8} columns={15}>
          {publicTribes.map((tribe: Team, index: number) => (
            <Grid item xs={3} key={index}>
              <DAOCard
                image={tribe.logo}
                title={tribe.name}
                members={tribe.members?.length}
                teamId={tribe.teamId}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ExploreTemplate;
