import { Close } from '@mui/icons-material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import {
  Autocomplete,
  Backdrop,
  Box,
  CircularProgress,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { ModalHeading, PrimaryButton } from '../styledComponents';

type Props = {
  // eslint-disable-next-line react/require-default-props
  handleModalClose?: () => void;
};

type Role = {
  id: string;
  name: string;
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '25%',
  transform: 'translate(-50%, -50%)',
  width: '35rem',
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

function SpaceRoleMapping({ handleModalClose }: Props) {
  const { space, setSpace } = useSpace();
  const [roles, setRoles] = useState<Role[]>([]);
  const { runMoralisFunction } = useMoralisFunction();

  const [stewardRoles, setStewardRoles] = useState<Role[]>([]);
  const [contributorRoles, setContributorRoles] = useState<Role[]>([]);
  const [memberRoles, setMemberRoles] = useState<Role[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const handleClose = () => {
    setIsOpen(false);
    setStewardRoles([]);
    setContributorRoles([]);
    setMemberRoles([]);
  };
  const getGuildRoles = async () => {
    const a: any = [];
    const b: any = [];
    const c: any = [];
    setIsFetching(true);
    const res = await fetch(
      `${
        process.env.DEV_ENV === 'local'
          ? 'http://localhost:3001/'
          : 'https://spect-discord-bot.herokuapp.com/'
      }api/guildRoles?guildId=${space.team[0].guildId}`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    setIsFetching(false);
    setRoles(data.roles);
    if (space.roleMapping) {
      data.roles.forEach((role: any) => {
        if (space.roleMapping[role.id] === 3) {
          a.push(role);
        } else if (space.roleMapping[role.id] === 2) {
          b.push(role);
        } else if (space.roleMapping[role.id] === 1) {
          c.push(role);
        }
      });
      setStewardRoles(a);
      setContributorRoles(b);
      setMemberRoles(c);
    }
  };
  useEffect(() => {
    if (isOpen) {
      getGuildRoles();
    }
  }, [isOpen]);
  return (
    <>
      <PrimaryButton
        variant="outlined"
        color="secondary"
        sx={{ my: 4 }}
        startIcon={<PeopleOutlineIcon />}
        disabled={!space.team[0].guildId}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Set Roles from Discord
      </PrimaryButton>
      {roles?.length > 0 && (
        <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
          <Grow in={isOpen} timeout={500}>
            <ModalContainer>
              <ModalHeading>
                <Typography sx={{ color: '#99ccff' }}>Member Roles</Typography>
                <Box sx={{ flex: '1 1 auto' }} />
                <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                  <Close />
                </IconButton>
              </ModalHeading>
              <ModalContent>
                <Backdrop
                  sx={{
                    color: '#eaeaea',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                  }}
                  open={isFetching}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2, mb: 1, color: '#eaeaea' }}>
                      Fetching roles please wait
                    </Typography>
                  </Box>
                </Backdrop>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
                  <Typography color="secondary" sx={{ mr: 8, width: '30%' }}>
                    Steward
                  </Typography>
                  <Autocomplete
                    options={roles}
                    multiple
                    getOptionLabel={(option) => option.name}
                    value={stewardRoles || []}
                    disableClearable
                    onChange={(event, newValue) => {
                      setStewardRoles(newValue as Role[]);
                    }}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} size="small" color="secondary" />
                    )}
                    sx={{ mr: 2 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
                  <Typography color="secondary" sx={{ mr: 8, width: '30%' }}>
                    Contributor
                  </Typography>
                  <Autocomplete
                    options={roles}
                    multiple
                    getOptionLabel={(option) => option.name}
                    value={contributorRoles || []}
                    disableClearable
                    onChange={(event, newValue) => {
                      setContributorRoles(newValue as Role[]);
                    }}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} size="small" color="secondary" />
                    )}
                    sx={{ mr: 2 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
                  <Typography color="secondary" sx={{ mr: 8, width: '30%' }}>
                    Member
                  </Typography>
                  <Autocomplete
                    options={roles}
                    multiple
                    getOptionLabel={(option) => option.name}
                    value={memberRoles || []}
                    disableClearable
                    onChange={(event, newValue) => {
                      setMemberRoles(newValue as Role[]);
                    }}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} size="small" color="secondary" />
                    )}
                    sx={{ mr: 2 }}
                  />
                </Box>
                <PrimaryButton
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 1 }}
                  loading={isLoading}
                  fullWidth
                  onClick={() => {
                    const newRoles: any = {};
                    setisLoading(true);
                    stewardRoles.forEach((role) => {
                      newRoles[role.id as any] = 3;
                    });
                    contributorRoles.forEach((role) => {
                      newRoles[role.id as any] = 2;
                    });
                    memberRoles.forEach((role) => {
                      newRoles[role.id as any] = 1;
                    });
                    runMoralisFunction('setSpaceRoleMapping', {
                      roleMapping: newRoles,
                      boardId: space.objectId,
                    }).then((res) => {
                      setSpace(res);
                      setisLoading(false);
                      if (handleModalClose) {
                        handleClose();
                        handleModalClose();
                      }
                      handleClose();
                    });
                  }}
                >
                  Set Roles
                </PrimaryButton>
              </ModalContent>
            </ModalContainer>
          </Grow>
        </Modal>
      )}
    </>
  );
}

export default SpaceRoleMapping;
