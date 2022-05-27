import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Grow,
  IconButton,
  Modal,
  styled as MUIStyled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Channel, Column } from '../../../types';
import CommonAutocomplete from '../../elements/autoComplete';
import ConfirmModal from '../../elements/confirmModal';
import {
  PrimaryButton,
  StyledAccordian,
  StyledModal,
} from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  column: Column;
};

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  marginTop: '-10%',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
  [theme.breakpoints.down('md')]: {
    padding: '1rem 2rem',
    width: '18rem',
  },
  [theme.breakpoints.up('md')]: {
    width: '55rem',
    padding: '1.5rem 3rem',
  },
}));

const Heading = MUIStyled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: '1px solid #99ccff',
  padding: 16,
  paddingLeft: 32,
}));

const Content = styled.div`
  @media only screen and (min-width: 0px) {
    padding: 0rem;
  }
  @media only screen and (min-width: 768px) {
    padding: 2rem;
  }
`;

function ColumnSettings({ isOpen, handleClose, column }: Props) {
  const [name, setName] = useState(column?.title);
  const [createCardRoles, setCreateCardRoles] = useState(column?.createCard);
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const [columnChannels, setColumnChannels] = useState<Channel[]>([]);
  const [serverChannels, setServerChannels] = useState<Channel[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const handleConfirmClose = () => setIsConfirmOpen(false);
  const handleConfirm = () => {
    runMoralisFunction('removeColumn', {
      boardId: space.objectId,
      columnId: column.id,
    })
      .then((res: BoardData) => {
        setSpace(res);
      })
      .catch((err: any) => {
        console.log(err);
        notify(err.message, 'error');
      });
  };

  useEffect(() => {
    if (isOpen && space.team[0].guildId) {
      runMoralisFunction('getGuildChannels', {
        guildId: space.team[0].guildId,
      }).then((res) => {
        if (res.guildChannels) {
          setServerChannels(res.guildChannels);
        }
      });
      setColumnChannels(column?.discordChannels || []);
    }
  }, [isOpen]);

  return (
    <>
      <StyledModal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <Heading>
              <Typography>Column Settings</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 1 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <Content>
              <TextField
                placeholder="Column Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                color="secondary"
                sx={{ mb: 2 }}
                size="small"
              />
              <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Permissions</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {/* <Typography>Set permissions for this column</Typography> */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ mr: 8, width: '30%' }}>
                      Can create cards
                    </Typography>
                    <FormControlLabel
                      value="end"
                      control={
                        <Checkbox
                          color="default"
                          checked={createCardRoles[0]}
                          onChange={(event) => {
                            setCreateCardRoles({
                              ...createCardRoles,
                              0: event.target.checked,
                            });
                          }}
                        />
                      }
                      label="Anyone"
                      labelPlacement="end"
                    />
                    <FormControlLabel
                      value="end"
                      control={
                        <Checkbox
                          color="default"
                          checked={createCardRoles[1]}
                          onChange={(event) => {
                            setCreateCardRoles({
                              ...createCardRoles,
                              1: event.target.checked,
                            });
                          }}
                        />
                      }
                      label="Member"
                      labelPlacement="end"
                    />
                    <FormControlLabel
                      value="end"
                      control={
                        <Checkbox
                          color="default"
                          checked={createCardRoles[2]}
                          onChange={(event) => {
                            setCreateCardRoles({
                              ...createCardRoles,
                              2: event.target.checked,
                            });
                          }}
                        />
                      }
                      label="Contributor"
                      labelPlacement="end"
                    />
                    <FormControlLabel
                      value="end"
                      control={
                        <Checkbox
                          color="default"
                          checked={createCardRoles[3]}
                          onChange={(event) => {
                            setCreateCardRoles({
                              ...createCardRoles,
                              3: event.target.checked,
                            });
                          }}
                        />
                      }
                      label="Steward"
                      labelPlacement="end"
                    />
                  </Box>
                </AccordionDetails>
              </StyledAccordian>
              <Tooltip
                title={
                  space.team[0].guildId
                    ? ''
                    : 'Connect discord on tribe to set up discord notifications'
                }
                placement="top"
              >
                <StyledAccordian
                  disableGutters
                  disabled={!space.team[0].guildId}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Discord Notifications</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography fontSize={14}>
                      Notify on your server&apos;s channels once a card is
                      created
                    </Typography>
                    <CommonAutocomplete
                      options={serverChannels}
                      optionLabels={(option) => `#${option.name}`}
                      currOption={columnChannels}
                      setCurrOption={setColumnChannels}
                      closeOnSelect={false}
                      sx={{ mt: 2 }}
                      multiple
                      placeholder="Search for channels"
                    />
                  </AccordionDetails>
                </StyledAccordian>
              </Tooltip>
              <Box sx={{ display: 'flex' }}>
                <PrimaryButton
                  variant="outlined"
                  color="secondary"
                  sx={{ width: '50%', mt: 2, mr: 4, borderRadius: 1 }}
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    runMoralisFunction('updateColumnSettings', {
                      boardId: space.objectId,
                      columnId: column.id,
                      createCardRoles,
                      channels: columnChannels,
                      title: name,
                    })
                      .then((res: BoardData) => {
                        notify('Settings updated');
                        setSpace(res);
                        setIsLoading(false);
                        handleClose();
                      })
                      .catch((err: any) => {
                        setIsLoading(false);
                        console.log(err);
                        notify(err.message);
                      });
                  }}
                >
                  Save
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  color="error"
                  sx={{ width: '50%', mt: 2, mr: 4, borderRadius: 1 }}
                  onClick={() => {
                    if (column.taskIds.length > 0) {
                      setIsConfirmOpen(true);
                      return;
                    }
                    handleConfirm();
                  }}
                >
                  Delete
                </PrimaryButton>
              </Box>
            </Content>
          </ModalContainer>
        </Grow>
      </StyledModal>
      <ConfirmModal
        isOpen={isConfirmOpen}
        handleClose={handleConfirmClose}
        buttonText="Yes, delete column"
        runOnConfirm={handleConfirm}
        modalContent={
          <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
            Are you sure you want to delete this column? This cannot be undone
          </Typography>
        }
      />
    </>
  );
}

export default ColumnSettings;
