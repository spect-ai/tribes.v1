import { Avatar, Breadcrumbs, Link, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData } from '../../../types';
import SidebarProfile from '../../elements/sidebarProfile';
import {
  PrimaryButton,
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { notify } from '../settingsTab';
import { NavbarContainer } from '../tribeNavbar/index';

type Props = {};

function SpaceNavbar(props: Props) {
  const { tab, handleTabChange, space, setSpace } = useSpace();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const { user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
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
          <Link underline="hover" color="inherit" href={`/tribe/${id}`}>
            {space.team && space.team[0]?.name}
          </Link>
          <Link
            underline="none"
            color="text.primary"
            href={`/tribe/${id}/space/${bid}`}
          >
            {space.name}
          </Link>
        </Breadcrumbs>
        {space.roleMapping && !space.members.includes(user?.id as string) && (
          <Tooltip title="You can join space if you have the right discord role">
            <PrimaryButton
              variant="outlined"
              sx={{ borderRadius: 1, ml: 2, mb: 1 }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                runMoralisFunction('joinSpace', { boardId: bid })
                  .then((res: BoardData) => {
                    setSpace(res);
                    notify('You have succesfully joined the space');
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    console.log(err);
                    notify(
                      'User does not have the required role to join space, make sure you have linked discord and have the correct role',
                      'error'
                    );
                    setIsLoading(false);
                  });
              }}
            >
              Join Space
            </PrimaryButton>
          </Tooltip>
        )}
      </NavbarContainer>
      <StyledTabs value={tab} onChange={handleTabChange} centered>
        <StyledTab label="Board" />
        <StyledTab label="Epoch" />
        <StyledTab label="Members" />
      </StyledTabs>
      <SidebarProfile />
    </StyledNav>
  );
}

export default SpaceNavbar;
