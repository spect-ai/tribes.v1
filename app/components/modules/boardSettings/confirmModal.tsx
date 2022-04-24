import { Box, Grow, Modal, styled, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '35%',
  left: '35%',
  transform: 'translate(-50%, -50%)',
  width: '25rem',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
};

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

function ConfirmModal({ isOpen, handleClose }: Props) {
  const { space } = useSpace();
  const router = useRouter();
  const id = router.query.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();

  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <Box sx={modalStyle}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
              Are you sure you want to delete {space.name}?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <PrimaryButton
                variant="outlined"
                sx={{ width: '50%', mt: 2, mr: 1 }}
                onClick={handleClose}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                variant="outlined"
                sx={{ width: '50%', mt: 2 }}
                color="error"
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  runMoralisFunction('deleteBoard', { boardId: space.objectId })
                    .then((res: any) => {
                      handleClose();
                      router.push(`/tribe/${id}`);
                      setIsLoading(false);
                    })
                    .catch((err: any) => {
                      notify(
                        `Sorry! There was an error while deleting board.`,
                        'error'
                      );
                      setIsLoading(false);
                    });
                }}
              >
                Delete Space
              </PrimaryButton>
            </Box>
          </ModalContent>
        </Box>
      </Grow>
    </Modal>
  );
}

export default ConfirmModal;
