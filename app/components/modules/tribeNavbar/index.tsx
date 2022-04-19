import styled from '@emotion/styled';
import { Avatar, Breadcrumbs, Link, Skeleton, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { Team } from '../../../types';
import SidebarProfile from '../../elements/sidebarProfile';
import {
  PrimaryButton,
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {};

const TribeNavbar = (props: Props) => {
  const { tab, handleTabChange, tribe, loading, setTribe } = useTribe();
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const router = useRouter();
  const { user } = useMoralis();
  const id = router.query.id as string;
  const waitForDiscordLink = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 6000));
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      runMoralisFunction('getTeam', { teamId: id }).then((res: Team) => {
        console.log(res);
        setTribe(res);
        console.log(res.guildId);
        if (res.guildId && res.guildId !== 'undefined') {
          notify('Discord server linked');
          setIsLoading(false);
        }
      });
      if (!isLoading) {
        break;
      }
    }
  };
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
        {!tribe.guildId && tribe.roles[user?.id as string] === 3 && (
          <a
            href={`https://discord.com/oauth2/authorize?client_id=942494607239958609&permissions=17448306704&redirect_uri=${
              process.env.DEV_ENV === 'local'
                ? 'http://localhost:3001/'
                : 'https://spect-discord-bot.herokuapp.com/'
            }api/linkDiscordBot&response_type=code&scope=bot&state=%7B%22teamId%22%3A%22${id}%22%2C%22redirect%22%3A%22%2Ftribe%2F${id}%22%7D`}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
            }}
          >
            <PrimaryButton
              variant="outlined"
              sx={{ borderRadius: 1, ml: 2, mb: 1 }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={waitForDiscordLink}
            >
              Connect Discord
            </PrimaryButton>
          </a>
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
};

export const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 0.8rem;
`;

export default TribeNavbar;
