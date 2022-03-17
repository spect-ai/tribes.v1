import { Avatar, Breadcrumbs, Link, useTheme } from "@mui/material";
import React from "react";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import { NavbarContainer } from "../../../components/modules/tribeNavbar/index";
import SidebarProfile from "../../elements/sidebarProfile";

type Props = {};

const SpaceNavbar = (props: Props) => {
  const { tab, handleTabChange, space } = useSpace();
  const { palette } = useTheme();
  return (
    <StyledNav>
      <NavbarContainer>
        <Avatar
          variant="rounded"
          sx={{ p: 0, m: 0, width: 28, height: 28 }}
          src={space.team && space.team[0]?.logo}
        >
          {space.team && space.team[0]?.name[0]}
        </Avatar>
        <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 4 }}>
          <Link underline="hover" color="inherit" href="/">
            {space.team && space.team[0]?.name}
          </Link>
          <Link underline="hover" color="text.primary" href="/">
            {space.name}
          </Link>
        </Breadcrumbs>
      </NavbarContainer>
      <StyledTabs value={tab} onChange={handleTabChange} centered>
        <StyledTab label="Board" />
        <StyledTab label="Epoch" />
        <StyledTab label="Members" />
      </StyledTabs>
      <SidebarProfile />
    </StyledNav>
  );
};

export default SpaceNavbar;
