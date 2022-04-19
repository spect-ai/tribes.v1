import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useMoralis } from 'react-moralis';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { ModalHeading, PrimaryButton } from '../../elements/styledComponents';
import { SidebarButton } from '../exploreSidebar';
import { notify } from '../settingsTab';

type Props = {};

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '35%',
  transform: 'translate(-50%, -50%)',
  width: '30rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

function CreateTribeModal(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { palette } = useTheme();

  const { isAuthenticated, authenticate } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();

  const onSubmit = () => {
    setIsLoading(true);
    runMoralisFunction('createTribe', { name })
      .then((res: any) => {
        setIsLoading(false);
        handleClose();
        router.push({
          pathname: `/tribe/${res.get('teamId')}`,
        });
      })
      .catch((err: any) => {
        setIsLoading(false);
        handleClose();
        notify(err.message, 'error');
      });
  };

  return (
    <>
      <Toaster />
      <Tooltip title="Create Tribe" placement="right" arrow sx={{ m: 0, p: 0 }}>
        <SidebarButton
          palette={palette}
          selected={false}
          onClick={() => {
            if (!isAuthenticated) {
              authenticate();
            } else {
              handleOpen();
            }
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 30, color: palette.divider }} />
        </SidebarButton>
      </Tooltip>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography color="inherit">Create Tribe</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <TextField
                placeholder="Tribe Name"
                fullWidth
                value={name}
                onChange={(evt) => setName(evt.target.value)}
                color="secondary"
              />
              <PrimaryButton
                variant="outlined"
                sx={{ width: '60%', mt: 2, borderRadius: 1 }}
                onClick={onSubmit}
                loading={isLoading}
                color="inherit"
              >
                Create your tribe
              </PrimaryButton>
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
}

export default CreateTribeModal;
