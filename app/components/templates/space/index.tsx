import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Fade, Grow, Box, Modal, Typography } from '@mui/material';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import CardModal from '../../modules/cardModal';
import DiscordIntegrationModal from '../../modules/discordIntegrationModal';
import Project from '../../modules/project';
import EpochList from '../../modules/epoch';
import NoAccess from '../../modules/epoch/noAccess';
import ProjectSkeletonLoader from '../../modules/project/skeletonLoader';
import SpaceSettings from '../../modules/spaceSettings';
import Search from '../../modules/search';

type Props = {};

const OuterDiv = styled.div`
  margin-left: 60px;
  margin-top: 60px;
  width: 100%;
`;

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.default',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function BoardsTemplate(props: Props) {
  const router = useRouter();
  const { user } = useMoralis();
  const { taskId, id, bid } = router.query;

  const { space, isLoading, tab } = useSpace();
  const [isOpen, setIsOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const handlesOpen = () => setOpen(true);
  const handlesClose = () => setOpen(false);

  const handleClose = () => {
    setIsOpen(false);
    router.push(`/tribe/${id}/space/${bid}`);
  };
  const handleDiscordModalClose = () => {
    setIsDiscordModalOpen(false);
  };

  useEffect(() => {
    if (taskId && !isLoading) {
      setIsOpen(true);
    }

    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        handlesOpen();
      }
    };
    window.addEventListener('keyup', handler);

    return () => {
      window.removeEventListener('keyup', handler);
    };
  }, [taskId, isLoading]);

  if (isLoading) {
    return <ProjectSkeletonLoader />;
  }

  return (
    <OuterDiv>
      <Modal
        open={open}
        onClose={handlesClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            color="secondary"
          >
            {space.name}
            <Search />
          </Typography>
        </Box>
      </Modal>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={taskId as string}
      />
      <Fade in={!isLoading} timeout={500}>
        <div>
          <DiscordIntegrationModal
            isOpen={isDiscordModalOpen}
            handleClose={handleDiscordModalClose}
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
          {/* {tab === 2 && (
            <Grow in={tab === 2} timeout={500}>
              <div>
                <SpaceMembers />
              </div>
            </Grow>
          )} */}
          {tab === 2 && (
            <Grow in={tab === 2} timeout={500}>
              <div>
                <SpaceSettings />
              </div>
            </Grow>
          )}
        </div>
      </Fade>
    </OuterDiv>
  );
}

export default BoardsTemplate;
