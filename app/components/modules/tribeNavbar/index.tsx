import styled from "@emotion/styled";
import { Avatar, Breadcrumbs, Link, Skeleton, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import SidebarProfile from "../../elements/sidebarProfile";
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";

type Props = {};

const TribeNavbar = (props: Props) => {
  const { tab, handleTabChange, tribe, loading } = useTribe();
  const { palette } = useTheme();
  const { user } = useMoralis();
  if (loading) {
    return (
      <StyledNav>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={40}
          animation="wave"
          sx={{ mx: 8 }}
        />
      </StyledNav>
    );
  }

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
          <Link underline="none" color="text.primary">
            {tribe.name}
          </Link>
        </Breadcrumbs>
      </NavbarContainer>
      <StyledTabs value={tab} onChange={handleTabChange} centered>
        <StyledTab label="Overview" />
        <StyledTab label="Members" />
        <StyledTab
          label="Settings"
          // disabled={tribe.roles[user?.id as string] !== 3}
        />
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
