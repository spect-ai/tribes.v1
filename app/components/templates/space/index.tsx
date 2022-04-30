import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Fade, Grow } from '@mui/material';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import CardModal from '../../modules/cardModal';
import { notify } from '../../modules/settingsTab';
import DiscordIntegrationModal from '../../modules/discordIntegrationModal';
import Project from '../../modules/project';
import EpochList from '../../modules/epoch';
import NoAccess from '../../modules/epoch/noAccess';
import SpaceMembers from '../../modules/spaceMembers';
import ProjectSkeletonLoader from '../../modules/project/skeletonLoader';

type Props = {};

const OuterDiv = styled.div`
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  width: 100%;
`;

function BoardsTemplate(props: Props) {
  const router = useRouter();
  const { user } = useMoralis();
  const { inviteCode, taskId, id, bid } = router.query;
  const { isAuthenticated, authenticate } = useMoralis();
  const { space, setSpace, isLoading, tab, handleTabChange } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
    router.push(`/tribe/${id}/space/${bid}`);
  };
  useEffect(() => {
    if (inviteCode && !isLoading) {
      if (!isAuthenticated) {
        authenticate();
        return;
      }
      runMoralisFunction('joinSpaceFromInvite', {
        inviteCode,
        boardId: router.query.bid as string,
      })
        .then((res) => {
          setSpace(res);
          notify('You have joined the space successfully');
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
        })
        .catch((err) => {
          console.error(err);
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
          notify(err.message, 'error');
        });
    }
  }, [inviteCode, isAuthenticated, isLoading]);

  useEffect(() => {
    if (taskId && !isLoading) {
      setIsOpen(true);
    }
  }, [taskId, isLoading]);

  if (isLoading) {
    return <ProjectSkeletonLoader />;
  }

  return (
    <OuterDiv>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={taskId as string}
      />
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
                <Project />
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
                <SpaceMembers />
              </div>
            </Grow>
          )}
        </div>
      </Fade>
    </OuterDiv>
  );
}

export default BoardsTemplate;