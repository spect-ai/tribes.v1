/* eslint-disable @next/next/no-html-link-for-pages */
import React from 'react';
import { styled, Box } from '@mui/material';
import Image from 'next/image';
import { useExplore } from '../../../../pages';
import SidebarProfile from '../../elements/sidebarProfile';
import Logo from '../../../images/logo.png';
import { StyledNav } from '../../elements/styledComponents';

type Props = {};

function ProfileNavbar(props: Props) {
  return (
    <StyledNav>
      <Box sx={{ ml: 3 }}>
        <Image src={Logo} alt="Landscape picture" width={110} height={40} />
      </Box>

      <SidebarProfile />
    </StyledNav>
  );
}

export default ProfileNavbar;
