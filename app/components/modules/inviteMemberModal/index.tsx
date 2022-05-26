import SendIcon from '@mui/icons-material/Send';
import {
  Autocomplete,
  Box,
  Fade,
  Modal,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { ModalHeading, PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';
import { expiryOptions, roleOptions, usesOptions } from './constants';

type Props = {};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
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

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
}));

function InviteMemberModal(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { space } = useSpace();
  const handleClose = () => setIsOpen(false);
  const [role, setRole] = useState<any>();
  const [uses, setUses] = useState<any>();
  const [expiry, setExpiry] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  return (
    <>
      <PrimaryButton
        variant="outlined"
        color="secondary"
        startIcon={<SendIcon />}
        sx={{ my: 4, ml: 4 }}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Invite Member
      </PrimaryButton>
      <Modal open={isOpen} onClose={handleClose}>
        <Fade in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography>Invite Member</Typography>
            </ModalHeading>
            <ModalContent>
              <Autocomplete
                options={roleOptions}
                getOptionLabel={(option) => option.name}
                value={role}
                onChange={(event, newValue) => {
                  setRole(newValue);
                }}
                fullWidth
                placeholder="Role"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    color="secondary"
                    placeholder="Role"
                  />
                )}
                sx={{ my: 2 }}
              />
              <Autocomplete
                options={expiryOptions}
                getOptionLabel={(option) => option.name}
                value={expiry}
                onChange={(event, newValue) => {
                  setExpiry(newValue);
                }}
                fullWidth
                placeholder="Role"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    color="secondary"
                    placeholder="Expire After"
                  />
                )}
                sx={{ my: 2 }}
              />
              <Autocomplete
                options={usesOptions}
                getOptionLabel={(option) => option.name}
                value={uses}
                onChange={(event, newValue) => {
                  setUses(newValue);
                }}
                fullWidth
                placeholder="Role"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    color="secondary"
                    placeholder="Max limit of uses"
                  />
                )}
                sx={{ my: 2 }}
              />
              <PrimaryButton
                variant="outlined"
                color="secondary"
                loading={isLoading}
                sx={{ mt: 4 }}
                onClick={() => {
                  setIsLoading(true);
                  runMoralisFunction('generateInviteLink', {
                    boardId: space.objectId,
                    role: role.role,
                    uses: uses.uses,
                    expiry: expiry.expiry,
                  })
                    .then((res) => {
                      const link = `${window.location.origin}?inviteCode=${res[0].id}`;
                      navigator.clipboard.writeText(link);
                      notify('Link copied');
                      handleClose();
                      setIsLoading(false);
                    })
                    .catch((err) => {
                      console.log(err);
                      setIsLoading(false);
                    });
                }}
              >
                Generate Link
              </PrimaryButton>
            </ModalContent>
          </ModalContainer>
        </Fade>
      </Modal>
    </>
  );
}

export default InviteMemberModal;
