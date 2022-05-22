import { Box, Grow, styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import { PrimaryButton, StyledModal } from '../styledComponents';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  buttonText: string;
  modalContent: any;
  runOnConfirm: any;
  confirmButtonSx?: any;
  confirmButtonColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  transform: 'translate(-50%, -50%)',
  width: '30rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

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
  confirmButtonSx,
  confirmButtonColor,
}: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <StyledModal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <ModalContent>
            {modalContent}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <PrimaryButton
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ width: '50%', mr: 2 }}
                onClick={handleClose}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                data-testid="bConfirmAction"
                variant="outlined"
                sx={confirmButtonSx || { width: '50%' }}
                color={confirmButtonColor || 'error'}
                size="small"
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
        </ModalContainer>
      </Grow>
    </StyledModal>
  );
}

export default ConfirmModal;
