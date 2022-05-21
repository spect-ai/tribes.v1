/* eslint-disable @next/next/no-html-link-for-pages */
import React from 'react';
import { styled, Box } from '@mui/material';
import Image from 'next/image';
import { useExplore } from '../../../../pages';
import SidebarProfile from '../../elements/sidebarProfile';
import Logo from '../../../images/logo.png';

type Props = {};

export const ProfileNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '3rem',
  width: '100%',
  paddingTop: '0.4rem',
}));

function ProfileNavbar(props: Props) {
  return (
    <ProfileNav>
      <Image src={Logo} alt="Landscape picture" width={100} height={40} />

      <SidebarProfile />
    </ProfileNav>
  );
}

export default ProfileNavbar;
