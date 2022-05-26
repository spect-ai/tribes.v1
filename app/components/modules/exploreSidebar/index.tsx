import styled from '@emotion/styled';
import ExploreIcon from '@mui/icons-material/Explore';
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Palette,
  Tooltip,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { StyledAvatar } from '../../elements/styledComponents';
import PaymentModal from '../batchPay';
import BoardSettings from '../boardSettings';
import CreateTribeModal from '../createTribeModal';
import { notify } from '../settingsTab';

type Props = {};

export const SidebarButton = styled.div<{
  palette: Palette;
  selected: boolean;
}>`
  &:hover {
    color: ${(props) => props.palette.secondary.main};
    border-left: 2px solid ${(props) => props.palette.secondary.main};
  }
  transition: all 0.5s ease-in-out;
  cursor: pointer;
  padding: 0rem 1rem;
  border-left: 2px solid
    ${(props) =>
      props.selected ? props.palette.secondary.main : 'transparent'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px 0px;
`;

const SidebarContainer = styled.div<{ palette: Palette }>`
  background-color: ${(props) => props.palette.primary.main};
  transition: 0.5s;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow-y: auto;
  position: fixed;
  z-index: 1;
  top: 56px;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  @media only screen and (min-width: 0px) {
    width: 2.4rem;
  }
  @media only screen and (min-width: 768px) {
    width: 4rem;
  }
`;

export const ButtonText = styled.div`
  overflow: hidden;
  height: 20px;
  width: 86%;
  transition: 0.5s;
  text-transform: none;
`;

function ExploreSidebar(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tribeSpaces, setTribeSpaces] = useState([]);
  const [myTribes, setMyTribes] = useState<any[]>([] as any[]);
  const { palette } = useTheme();
  const { isInitialized, isAuthenticated } = useMoralis();
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const handleClose = () => setIsOpen(false);
  const { runMoralisFunction } = useMoralisFunction();

  const initializeData = async () => {
    try {
      if (isAuthenticated) {
        // const tribes = await getMyTeams(Moralis);
        const tribes = await runMoralisFunction('getMyTeams', {});
        // const spaces = await getEssentialBoardsInfo(Moralis, id);
        const spaces = await runMoralisFunction('getEssentialBoardsInfo', {
          teamId: id,
        });
        setMyTribes(tribes);
        setTribeSpaces(spaces);
      }
    } catch (e) {
      console.log(e);
      notify('Error in initalizing sidebar data', 'error');
    }
  };

  useEffect(() => {
    if (isInitialized) {
      initializeData();
    }
  }, [isInitialized, isAuthenticated]);

  return (
    <SidebarContainer palette={palette}>
      <Box sx={{ mt: 4 }} />
      <Drawer anchor="right" open={isOpen} onClose={handleClose}>
        <List
          sx={{
            maxWidth: '10rem',
            backgroundColor: palette.background.default,
            height: '100%',
          }}
        >
          {tribeSpaces.map((space: any, index) => (
            <Link
              href={`/tribe/${id}/space/${space.objectId}`}
              key={space.objectId}
              passHref
            >
              <ListItemButton selected={space.objectId === bid}>
                <ListItemText primary={space.name} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Drawer>
      <Link href="/" passHref>
        <SidebarButton palette={palette} selected={!id}>
          <Tooltip title="Explore" placement="right" arrow sx={{ m: 0, p: 0 }}>
            <ExploreIcon
              sx={{
                fontSize: 28,
                color: !id ? palette.secondary.main : palette.divider,
              }}
            />
          </Tooltip>
        </SidebarButton>
      </Link>
      {bid && (
        <SidebarButton
          palette={palette}
          selected={!id}
          onClick={() => setIsOpen(true)}
        >
          <Tooltip
            title="Switch Space"
            placement="right"
            arrow
            sx={{ m: 0, p: 0 }}
          >
            <SwitchLeftIcon
              sx={{
                fontSize: 28,
                color: !id ? palette.secondary.main : palette.divider,
              }}
            />
          </Tooltip>
        </SidebarButton>
      )}
      {bid && isAuthenticated && <BoardSettings />}
      {bid && isAuthenticated && <PaymentModal />}
      <Divider sx={{ my: 5, mx: 3 }} />
      <CreateTribeModal />
      {myTribes?.map((tribe) => (
        <Link
          key={tribe.get('teamId')}
          href={`/tribe/${tribe.get('teamId')}`}
          passHref
        >
          <SidebarButton
            palette={palette}
            selected={tribe.get('teamId') === id}
          >
            <StyledAvatar
              variant="rounded"
              sx={{ p: 0, m: 0, width: 28, height: 28 }}
              src={tribe.get('logo')}
            >
              {tribe.get('name')[0]}
            </StyledAvatar>
          </SidebarButton>
        </Link>
      ))}
    </SidebarContainer>
  );
}

export default ExploreSidebar;
