/* eslint-disable @next/next/no-html-link-for-pages */
import { styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { useExplore } from '../../../../pages';
import SidebarProfile from '../../elements/sidebarProfile';
type Props = {};

const Navbar = (props: Props) => {
  const { tab, setTab } = useExplore();
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  return (
    <StyledNav>
      <StyledTabs
        value={tab}
        onChange={handleTabChange}
        centered
        sx={{ width: '100%', ml: '6rem' }}
      >
        <StyledTab label="Explore Tribes" />
      </StyledTabs>
      <SidebarProfile />
    </StyledNav>
  );
};

export default Navbar;
