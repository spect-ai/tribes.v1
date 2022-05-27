import { GitHub } from '@mui/icons-material';
import {
  Box,
  styled as MUIStyled,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Chain, Channel, Token } from '../../../types';
import DefaultPaymentForm from '../../elements/defaultPaymentForm';
import {
  PrimaryButton,
  StyledTabs,
  StyledTab,
} from '../../elements/styledComponents';
import { notify } from '../settingsTab';
import ConfirmModal from './confirmModal';
import SpaceMembers from '../spaceMembers';
import ConnectDiscord from '../../elements/connectDiscord';
import CommonAutocomplete from '../../elements/autoComplete';

type Props = {};

// Grid
const Item = MUIStyled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function SpaceSettings(props: Props) {
  // Tabs
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const { space, setSpace, setRefreshEpochs } = useSpace();
  const { user } = useMoralis();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [defaultToken, setDefaultToken] = useState<Token>({} as Token);
  const [defaultChain, setDefaultChain] = useState<Chain>({} as Chain);
  const [discussionChannel, setDiscussionChannel] = useState<Channel>(
    {} as Channel
  );
  const [serverChannels, setServerChannels] = useState<Channel[]>([]);

  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const { runMoralisFunction } = useMoralisFunction();
  useEffect(() => {
    setName(space.name);
    setDescription(space.description);
    setGithub(space.github);
    setTwitter(space.twitter);
    setDiscord(space.discord);
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
      {isConfirmOpen && (
        <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
      )}
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={4} md={3} lg={3}>
            <Item>
              <Box sx={{ width: '100%', mt: 16 }}>
                <StyledTabs
                  orientation="vertical"
                  value={value}
                  onChange={handleChange}
                >
                  <StyledTab label="Space Profile" {...a11yProps(0)} />
                  <StyledTab label="Access" {...a11yProps(1)} />
                  <StyledTab label="Integrations" {...a11yProps(2)} />
                  <StyledTab label="Payments" {...a11yProps(3)} />
                </StyledTabs>
              </Box>
            </Item>
          </Grid>
          <Grid item xs={8} md={9} lg={9}>
            <Item>
              <TabPanel value={value} index={0}>
                Space Profile
                <Box m={2} pt={3}>
                  <TextField
                    label="Space Name"
                    placeholder="Space Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    color="secondary"
                  />
                </Box>
                <Box m={2} pt={3}>
                  <TextField
                    label="About"
                    placeholder="Space Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    color="secondary"
                  />
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <SpaceMembers />
              </TabPanel>
              <TabPanel value={value} index={2}>
                Space Access
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
                    <Box sx={{ mx: 32 }}>
                      <Typography fontSize={14} sx={{ mt: 4 }}>
                        Assign a channel in your discord server where tasks can
                        be discussed
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
                    </Box>
                  )}
                </Box>
              </TabPanel>
              <TabPanel value={value} index={3}>
                <Typography>
                  Default payment for all the new tasks created
                </Typography>
                <DefaultPaymentForm
                  chain={defaultChain}
                  setChain={setDefaultChain}
                  token={defaultToken}
                  setToken={setDefaultToken}
                />
              </TabPanel>
            </Item>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                ml: 8,
              }}
            >
              <PrimaryButton
                variant="outlined"
                color="secondary"
                sx={{ width: '30%', mt: 2, borderRadius: 1 }}
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
                    description,
                    github,
                    twitter,
                    discord,
                    defaultPayment: {
                      chain: defaultChain,
                      token: defaultToken,
                    },
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
                sx={{ width: '30%', mt: 2, borderRadius: 1 }}
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
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default SpaceSettings;
