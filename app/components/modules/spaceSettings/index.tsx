import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Grow,
  IconButton,
  Modal,
  styled as MUIStyled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Grid,
  Paper,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Chain, Token } from '../../../types';
import DefaultPaymentForm from '../../elements/defaultPaymentForm';
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { SidebarButton } from '../exploreSidebar';
import { notify } from '../settingsTab';
import ConfirmModal from './confirmModal';
import SpaceMembers from '../spaceMembers';

type Props = {};

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '10%',
  transform: 'translate(-50%, -50%)',
  width: '70rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const ModalContent = MUIStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

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
  const { Moralis, user } = useMoralis();
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [defaultToken, setDefaultToken] = useState<Token>({} as Token);
  const [defaultChain, setDefaultChain] = useState<Chain>({} as Chain);
  const [tokenGatechain, setTokenGateChain] = useState<Chain>({} as Chain);
  const [tokenGateToken, setTokenGateToken] = useState<Token>({} as Token);
  const [tokenGateLimit, setTokenGateLimit] = useState<string>('');
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const { palette } = useTheme();
  const { runMoralisFunction } = useMoralisFunction();
  useEffect(() => {
    setName(space.name);
    // setTokenGateChain(space.tokenGating?.chain);
    // setTokenGateToken(space.tokenGating?.token);
    // setTokenGateLimit(space.tokenGating?.tokenLimit);
    setDefaultChain(space.defaultPayment?.chain);
    setDefaultToken(space.defaultPayment?.token);
  }, [space]);
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
      {isConfirmOpen && (
        <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
      )}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography>Settings</Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent
              sx={{
                border: 1,
                borderColor: 'text.primary',
                borderRadius: '16px',
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={4} md={3} lg={3}>
                    <Item>
                      <Box sx={{ width: '100%' }}>
                        <StyledTabs
                          orientation="vertical"
                          value={value}
                          onChange={handleChange}
                          textColor="secondary"
                          indicatorColor="secondary"
                        >
                          <StyledTab label="Space Profile" {...a11yProps(0)} />
                          <StyledTab label="Members" {...a11yProps(1)} />
                          <StyledTab label="Access" {...a11yProps(2)} />
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
                            placeholder="Space Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            color="secondary"
                          />
                        </Box>
                        <Box m={2} pt={3}>
                          <TextField
                            label="Github"
                            placeholder="https://github.com/repo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            color="secondary"
                          />
                        </Box>
                        <Box m={2} pt={3}>
                          <TextField
                            p={2}
                            sx={{ width: '50%' }}
                            label="Twitter"
                            placeholder="https://twitter.com/username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            color="secondary"
                          />
                          <TextField
                            p={2}
                            sx={{ width: '50%' }}
                            label="Discord"
                            placeholder="https://discord.com/invitecode"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            color="secondary"
                          />
                        </Box>
                      </TabPanel>
                      <TabPanel value={value} index={1}>
                        <SpaceMembers />
                      </TabPanel>
                      <TabPanel value={value} index={2}>
                        Item Three
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
                  </Grid>
                </Grid>
              </Box>
              {/* <StyledAccordian disableGutters>
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
              </StyledAccordian> */}
              {/* <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Token Gating
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Enable token gating to allow addresses with the token limit
                    to automatically join space without any prior permissions
                  </Typography>
                  <TokenGateForm
                    chain={tokenGatechain || space?.tokenGating?.chain}
                    setChain={setTokenGateChain}
                    token={tokenGateToken || space?.tokenGating?.token}
                    setToken={setTokenGateToken}
                    tokenLimit={tokenGateLimit}
                    setTokenLimit={setTokenGateLimit}
                  />
                </AccordionDetails>
              </StyledAccordian> */}
              {/* <StyledAccordian disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Theme</Typography>
                </AccordionSummary>
                <OptionsButton color="inherit">
                  <ThemeColor color="#000f29" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 0).then(
                        (res: BoardData) => {
                          setSpace(res);
                          localStorage.setItem("theme", "0");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Classic Dark
                  </Typography>
                </OptionsButton>
                <OptionsButton color="inherit">
                  <ThemeColor color="#38006b" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 1).then(
                        (res: BoardData) => {
                          setSpace(res);
                          localStorage.setItem("theme", "1");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Warm Purple
                  </Typography>
                </OptionsButton>
                <OptionsButton color="inherit">
                  <ThemeColor color="#0288d1" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 2).then(
                        (res: BoardData) => {
                          setSpace(res);
                          console.log(res);
                          localStorage.setItem("theme", "2");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Ocean Blue
                  </Typography>
                </OptionsButton>
                <AccordionDetails></AccordionDetails>
              </StyledAccordian> */}
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
                      tokenGating: {
                        chain: tokenGatechain,
                        token: tokenGateToken,
                        tokenLimit: tokenGateLimit,
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
      </Modal>
    </>
  );
}

export default SpaceSettings;
