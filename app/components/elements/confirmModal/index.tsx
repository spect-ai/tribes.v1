import { Box, Grow, Modal, styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import { PrimaryButton } from '../styledComponents';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  buttonText: string;
  modalContent: string;
  runOnConfirm: any;
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

function ConfirmModal({
  isOpen,
  handleClose,
  buttonText,
  modalContent,
  runOnConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <Box sx={modalStyle}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
              {modalContent}
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
                loading={loading}
                onClick={() => {
                  handleClose();
                  runOnConfirm();
                }}
              >
                {buttonText}
              </PrimaryButton>
            </Box>
          </ModalContent>
        </Box>
      </Grow>
    </Modal>
  );
}

export default ConfirmModal;
