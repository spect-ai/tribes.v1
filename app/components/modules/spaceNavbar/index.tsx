import { Avatar, Breadcrumbs, Link, Tooltip, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import {
  PrimaryButton,
  StyledNav,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { NavbarContainer } from '../../../components/modules/tribeNavbar/index';
import SidebarProfile from '../../elements/sidebarProfile';
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';
import { joinSpace } from '../../../adapters/moralis';
import { notify } from '../settingsTab';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { BoardData } from '../../../types';

type Props = {};

const SpaceNavbar = (props: Props) => {
  const { tab, handleTabChange, space, setSpace } = useSpace();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const { user, Moralis } = useMoralis();
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
          <Link underline="none" color="text.primary">
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
                    console.log(res);
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
        {/* https://discord.com/oauth2/authorize?client_id=942494607239958609&permissions=17448306704&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fdiscord%2Fbot%26response_type%3Dcode%26scope%3Dbot%26state%3D%7B%22objectId%22%3A%22${bid}%22%2C%22redirect%22%3A%22%2Ftribe%2F${id}%2Fspace%2F${bid}%22%7D */}
        {!space.members?.includes(user?.id as string) &&
          parseFloat(space.tokenGating?.tokenLimit) > 0 && (
            <Tooltip title="You can join space if you have enough tokens">
              <PrimaryButton
                variant="outlined"
                sx={{ borderRadius: 1, mx: 4 }}
                loading={isLoading}
                color="secondary"
                onClick={async () => {
                  if (
                    window.ethereum.networkVersion !==
                    space.tokenGating.chain.chainId
                  ) {
                    notify(
                      `Connect to ${space.tokenGating.chain.chainId} chain.`,
                      'error'
                    );
                    return;
                  }
                  setIsLoading(true);
                  joinSpace(Moralis, bid, window.ethereum.chainId)
                    .then((res: any) => {
                      console.log(res);
                      setIsLoading(false);
                      setSpace(res);
                      notify('Joined Space Succesfully');
                    })
                    .catch((err: any) => {
                      setIsLoading(false);
                      notify(err.message, 'error');
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
};

export default SpaceNavbar;
