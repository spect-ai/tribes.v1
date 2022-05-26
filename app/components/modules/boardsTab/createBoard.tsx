import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Checkbox,
  Grid,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useGlobal } from '../../../context/globalContext';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { Chain, Token } from '../../../types';
import { ModalHeading, PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
  [theme.breakpoints.down('md')]: {
    top: '10%',
    left: '2%',
    padding: '1rem 2rem',
    width: '18rem',
  },
  [theme.breakpoints.up('md')]: {
    top: '10%',
    left: '35%',
    width: '30rem',
    padding: '1.5rem 3rem',
  },
}));

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

function CreateBoard({ isOpen, handleClose }: Props) {
  const { tribe } = useTribe();
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();

  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <ModalHeading>
            <Typography sx={{ color: '#99ccff' }}>Create Space</Typography>
            <Box sx={{ flex: '1 1 auto' }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </ModalHeading>
          <ModalContent>
            <TextField
              placeholder="Space Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              color="secondary"
            />
            <Grid container alignItems="center" marginTop={2}>
              <Grid item xs={6}>
                <PrimaryButton
                  data-testid="bCreateSpaceModalButton"
                  loading={isLoading}
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 1 }}
                  disabled={!name || name === ''}
                  onClick={() => {
                    setIsLoading(true);
                    runMoralisFunction('initBoard', {
                      name,
                      teamId: tribe.teamId,
                      isPrivate,
                    })
                      .then((res: any) => {
                        if (res) {
                          router.push(
                            `/tribe/${tribe.teamId}/space/${res.id}`,
                            undefined
                          );
                        }
                        setIsLoading(false);
                      })
                      .catch((err: any) => {
                        console.log(err);
                        notify(
                          'Sorry! There was an error while creating space',
                          'error'
                        );
                        setIsLoading(false);
                      });
                  }}
                >
                  Create Space
                </PrimaryButton>
              </Grid>
              <Grid item xs={6}>
                <Checkbox
                  inputProps={{
                    'aria-label': 'select all desserts',
                  }}
                  checked={isPrivate}
                  onChange={(e) => {
                    setIsPrivate(e.target.checked);
                  }}
                  color="default"
                />
              </Grid>
              <Grid item xs={1}>
                <Typography color="common.white">Private</Typography>
              </Grid>
            </Grid>
          </ModalContent>
        </ModalContainer>
      </Grow>
    </Modal>
  );
}

export default CreateBoard;
