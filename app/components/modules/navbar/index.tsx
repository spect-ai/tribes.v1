/* eslint-disable @next/next/no-html-link-for-pages */
import React from 'react';
import { useExplore } from '../../../../pages';
import SidebarProfile from '../../elements/sidebarProfile';
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';

type Props = {};

function Navbar(props: Props) {
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
}

export default Navbar;
