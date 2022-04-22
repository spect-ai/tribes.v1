import { Box, Modal, styled as MUIStyled, Typography } from '@mui/material';
import React from 'react';
import SpaceRoleMapping from '../../elements/spaceRoleMapping';
import { ModalHeading } from '../../elements/styledComponents';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  user: boolean;
};
// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '30rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const ModalContent = MUIStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
}));

function DiscordIntegrationModal({ isOpen, handleClose, user }: Props) {
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalContainer>
        <ModalHeading>
          <Typography>Discord Setup</Typography>
        </ModalHeading>
        <ModalContent>
          <>
            <Typography color="secondary" sx={{ textAlign: 'center' }}>
              Setup Member roles from Discord so they can join automatically
            </Typography>
            <SpaceRoleMapping handleModalClose={handleClose} />
          </>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}

export default DiscordIntegrationModal;
