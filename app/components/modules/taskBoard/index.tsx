import { Fade, Grow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import DiscordIntegrationModal from '../discordIntegrationModal';
import EpochList from '../epoch';
import NoAccess from '../epoch/noAccess';
import Members from '../spaceMembers';
import Board from './board';
import SkeletonLoader from './skeletonLoader';

type Props = {};

function TaskBoard(props: Props) {
  const { user } = useMoralis();
  const { isLoading, space, tab } = useSpace();
  const [isOpen, setIsOpen] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState<string | false>('board');
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setPanelExpanded(newExpanded ? panel : false);
    };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (
      !isLoading &&
      space.team[0].guildId &&
      !space.roleMapping &&
      space.roles[user?.id as string] === 3
    ) {
      setIsOpen(true);
    }
  }, [isLoading]);
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Fade in={!isLoading} timeout={500}>
      <div>
        <DiscordIntegrationModal
          isOpen={isOpen}
          handleClose={handleClose}
          user={false}
        />
        {tab === 0 && (
          <Grow in={tab === 0} timeout={500}>
            <div>
              <Board
                expanded={panelExpanded === 'board'}
                handleChange={handleChange}
              />
            </div>
          </Grow>
        )}
        {tab === 1 && (
          <Grow in={tab === 1} timeout={500}>
            <div>
              {user && user?.id in space.roles ? <EpochList /> : <NoAccess />}
            </div>
          </Grow>
        )}
        {tab === 2 && (
          <Grow in={tab === 2} timeout={500}>
            <div>
              <Members />
            </div>
          </Grow>
        )}
      </div>
    </Fade>
  );
}

export default TaskBoard;
