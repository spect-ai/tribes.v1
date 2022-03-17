import styled from "@emotion/styled";
import { Avatar, Breadcrumbs, Link, useTheme } from "@mui/material";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import SidebarProfile from "../../elements/sidebarProfile";
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";

type Props = {};

const TribeNavbar = (props: Props) => {
  const { tab, handleTabChange, tribe } = useTribe();
  const { palette } = useTheme();
  return (
    <StyledNav>
      <NavbarContainer>
        <Avatar
          variant="rounded"
          sx={{ p: 0, m: 0, width: 28, height: 28 }}
          src={tribe.logo}
        >
          {tribe.name && tribe.name[0]}
        </Avatar>
        <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 4 }}>
          <Link underline="hover" color="text.primary" href="/">
            {tribe.name}
          </Link>
        </Breadcrumbs>
      </NavbarContainer>
      <StyledTabs value={tab} onChange={handleTabChange} centered>
        <StyledTab label="Overview" />
        <StyledTab label="Settings" />
      </StyledTabs>
      <SidebarProfile />
    </StyledNav>
  );
};

export const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 0.8rem;
`;

export default TribeNavbar;
