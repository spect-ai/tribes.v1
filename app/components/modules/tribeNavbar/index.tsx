/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
import styled from '@emotion/styled';
import { Avatar, Box, Breadcrumbs, Link, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import ConnectDiscord from '../../elements/connectDiscord';
import SidebarProfile from '../../elements/sidebarProfile';
import {
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';

type Props = {};

export const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 0.8rem;
`;

function TribeNavbar(props: Props) {
  const { tab, handleTabChange, tribe, loading } = useTribe();
  const router = useRouter();
  const { user } = useMoralis();
  const { id } = router.query;

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
          <Link underline="none" color="text.primary" href={`/tribe/${id}`}>
            {tribe.name}
          </Link>
        </Breadcrumbs>
        {!tribe.guildId && tribe.roles[user?.id as string] === 3 && (
          <Box sx={{ ml: 4, mb: 2 }}>
            <ConnectDiscord entity="tribe" />
          </Box>
        )}
      </NavbarContainer>
      <StyledTabs value={tab} onChange={handleTabChange} centered>
        <StyledTab label="Overview" />
        <StyledTab label="Members" />
        <StyledTab
          label="Settings"
          disabled={tribe.roles[user?.id as string] !== 3}
        />
      </StyledTabs>
      <SidebarProfile />
    </StyledNav>
  );
}

export default TribeNavbar;
