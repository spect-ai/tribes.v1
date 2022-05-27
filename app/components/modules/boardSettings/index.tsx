import { GitHub } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Grow,
  IconButton,
  styled as MUIStyled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Chain, Channel, Token } from '../../../types';
import CommonAutocomplete from '../../elements/autoComplete';
import ConfirmModal from '../../elements/confirmModal';
import ConnectDiscord from '../../elements/connectDiscord';
import DefaultPaymentForm from '../../elements/defaultPaymentForm';
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
  StyledModal,
} from '../../elements/styledComponents';
import { SidebarButton } from '../exploreSidebar';
import { notify } from '../settingsTab';

type Props = {};

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

const ModalContent = MUIStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

function BoardSettings(props: Props) {
  const router = useRouter();
  const id = router.query.id as string;
  const { space, setSpace, setRefreshEpochs } = useSpace();
  const { user } = useMoralis();
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [defaultToken, setDefaultToken] = useState<Token>({} as Token);
  const [defaultChain, setDefaultChain] = useState<Chain>({} as Chain);
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discussionChannel, setDiscussionChannel] = useState<Channel>(
    {} as Channel
  );
  const [serverChannels, setServerChannels] = useState<Channel[]>([]);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const { palette } = useTheme();
  const { runMoralisFunction } = useMoralisFunction();

  const handleConfirm = async () => {
    setIsLoading(true);
    runMoralisFunction('deleteBoard', { boardId: space.objectId })
      .then((res: any) => {
        handleClose();
        router.push(`/tribe/${id}`);
        setIsLoading(false);
      })
      .catch((err: any) => {
        notify(`${err.message}`, 'error');
        setIsLoading(false);
      });
  };
  useEffect(() => {
    setName(space.name);
    setDefaultChain(space.defaultPayment?.chain);
    setDefaultToken(space.defaultPayment?.token);
  }, [space]);

  useEffect(() => {
    if (isOpen && space.team[0].guildId) {
      runMoralisFunction('getGuildChannels', {
        guildId: space.team[0].guildId,
      }).then((res) => {
        if (res.guildChannels) {
          setServerChannels(res.guildChannels);
        }
      });
      setDiscussionChannel(space.discussionChannel);
    }
  }, [isOpen, space]);

  return (
    <>
      <SidebarButton
        palette={palette}
        selected={isOpen}
        onClick={() => {
          if (space.roles[user?.id as string] !== 3) {
            notify(
              "You don't have permission to change settings for this space",
              'error'
            );
            return;
          }
          setIsOpen(true);
        }}
      >
        <Tooltip
          title="Space Settings"
          placement="right"
          arrow
          sx={{ m: 0, p: 0 }}
        >
          <SettingsIcon
            sx={{
              fontSize: 28,
              color: isOpen ? palette.secondary.main : palette.divider,
            }}
          />
        </Tooltip>
      </SidebarButton>
      <StyledModal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography>Settings</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <StyledAccordian disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Space Info</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <TextField
                    placeholder="Space Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Default Payment</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography>
                    Default payment for all the new tasks created
                  </Typography>
                  <DefaultPaymentForm
                    chain={defaultChain}
                    setChain={setDefaultChain}
                    token={defaultToken}
                    setToken={setDefaultToken}
                  />
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Integrations</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <a
                      href={`https://github.com/apps/spect-github-bot/installations/new?state=${space.objectId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      <PrimaryButton
                        startIcon={<GitHub />}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        <Typography>
                          {space.githubRepos?.length > 0
                            ? 'Github Connected'
                            : 'Connect Github'}
                        </Typography>
                      </PrimaryButton>
                    </a>
                    {space.team && !space.team[0].guildId ? (
                      <Box sx={{ mt: 2 }}>
                        <ConnectDiscord entity="space" />
                      </Box>
                    ) : (
                      <>
                        <Typography fontSize={14} sx={{ mt: 4 }}>
                          Assign a channel in your discord server where tasks
                          can be discussed
                        </Typography>

                        <CommonAutocomplete
                          options={serverChannels}
                          optionLabels={(option) => `#${option.name}`}
                          currOption={discussionChannel}
                          setCurrOption={setDiscussionChannel}
                          closeOnSelect={false}
                          sx={{ mt: 2 }}
                          placeholder="Search for channels"
                        />
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </StyledAccordian>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryButton
                  variant="outlined"
                  color="secondary"
                  sx={{ width: '50%', mt: 2, mr: 4, borderRadius: 1 }}
                  loading={isLoading}
                  onClick={() => {
                    if (
                      space.roles[user?.id as string] &&
                      space.roles[user?.id as string] !== 3
                    ) {
                      notify('Only stewards can update settings', 'error');
                      return;
                    }
                    setIsLoading(true);
                    runMoralisFunction('updateBoard', {
                      boardId: space.objectId,
                      name,
                      defaultPayment: {
                        chain: defaultChain,
                        token: defaultToken,
                      },
                      discussionChannel,
                    }).then((res: any) => {
                      setSpace(res as BoardData);
                      setIsLoading(false);
                      setRefreshEpochs(true);
                      handleClose();
                    });
                  }}
                >
                  Save
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: '50%', mt: 2, borderRadius: 1 }}
                  color="error"
                  onClick={() => {
                    if (
                      space.roles[user?.id as string] &&
                      space.roles[user?.id as string] !== 3
                    ) {
                      notify('Only stewards can update settings', 'error');
                      return;
                    }
                    setIsConfirmOpen(true);
                  }}
                >
                  Delete Space
                </PrimaryButton>
              </Box>
            </ModalContent>
          </ModalContainer>
        </Grow>
      </StyledModal>
      <ConfirmModal
        isOpen={isConfirmOpen}
        handleClose={handleConfirmClose}
        buttonText="Yes, delete space"
        runOnConfirm={handleConfirm}
        modalContent={
          <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
            Are you sure you want to delete space? This cannot be undone
          </Typography>
        }
      />
    </>
  );
}

export default BoardSettings;
