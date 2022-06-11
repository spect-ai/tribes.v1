import RedeemIcon from '@mui/icons-material/Redeem';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Grow,
  IconButton,
  Modal,
  Typography,
  TextField,
  Autocomplete,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMoralis } from 'react-moralis';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Chain, Registry, Token } from '../../../types';
import {
  getFlattenedNetworks,
  getFlattenedCurrencies,
} from '../../../utils/utils';
import { notify } from '../settingsTab';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
} from '../../elements/styledComponents';
import useMoralisFunction from '../../../hooks/useMoralisFunction';

type Props = {};

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
    width: '40rem',
    padding: '1.5rem 3rem',
  },
}));

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

interface EpochFormInput {
  name: string;
  type: string;
  duration: number;
  strategy: string;
  passThreshold?: number;
  column?: string;
  members?: string[];
  budgetValue?: number;
  budgetToken: Token;
  budgetChain: Chain;
  description: string;
}

function CreateEpoch(props: Props) {
  const { space, setSpace, handleTabChange, setRefreshEpochs } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  const { user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const [strategy, setStrategy] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { handleSubmit, control, setValue } = useForm<EpochFormInput>();

  const handleClose = () => {
    setIsOpen(false);
  };
  const [chain, setChain] = useState({
    chainId: space?.defaultPayment?.chain?.chainId,
    name: space?.defaultPayment?.chain?.name,
  } as Chain);
  const [token, setToken] = useState(
    registry[space?.defaultPayment?.chain?.chainId].tokens[
      space?.defaultPayment?.token?.address
    ] as Token
  );

  const [isChecked, setIsChecked] = useState(
    Array(space.members?.length).fill(true)
  );
  const [allocations, setAllocations] = useState(
    Array(space.members?.length).fill(100)
  );
  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked.map((v, i) => (i === index ? !v : v)));
  };
  const handleAllocation = (index: number, value: number) => {
    setAllocations(
      allocations.map((v, i) => (i === index ? value : allocations[i]))
    );
  };

  const getMembers = () => {
    const members = [];
    for (let i = 0; i < space.members.length; i += 1) {
      if (isChecked[i]) {
        const member = {
          objectId: space.members[i],
          votesAllocated: allocations[i],
        };
        members.push(member);
      }
    }
    return members;
  };

  const getMemberChoices = () => {
    const choices = [] as string[];
    for (let i = 0; i < space.members.length; i += 1) {
      if (isChecked[i]) {
        choices.push(space.members[i]);
      }
    }
    return choices;
  };

  const onSubmit: SubmitHandler<EpochFormInput> = async (values) => {
    const temp = { ...space };
    temp.creatingEpoch = true;
    setSpace(temp);
    const members = getMembers();
    const choices = getMemberChoices();
    if (values.type === 'Member' && members.length <= 1) {
      notify('At least 2 members required', 'error');
      return;
    }
    runMoralisFunction('startEpoch', {
      teamId: space.teamId,
      spaceId: space.objectId,
      name: values.name,
      type: values.type,
      duration: values.duration * 86400000,
      strategy: values.strategy,
      budget: values.budgetValue,
      startTime: Date.now(),
      token,
      chain,
      members,
      choices,
      nativeCurrencyPayment: token.address !== '0x0',
    })
      .then((res: any) => {
        handleClose();
        setRefreshEpochs(true);
        handleTabChange({} as any, 1);
      })
      .catch((err: any) => alert(err));
  };

  const onError = (err: any) => {
    console.log(err);
    notify('Please fill all the fields', 'error');
  };
  return (
    <>
      {user && space.roles[user?.id] === 3 && (
        <PrimaryButton
          data-testid="bCreateEpoch"
          variant="outlined"
          size="large"
          color="secondary"
          endIcon={<RedeemIcon />}
          onClick={() => {
            setIsOpen(true);
          }}
          sx={{ borderRadius: 1, my: 2 }}
        >
          Start a retro period
        </PrimaryButton>
      )}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography sx={{ color: '#99ccff' }}>
                Start a retro period
              </Typography>
              <Box sx={{ flex: '1 1 auto' }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5, ml: 2 }}
                  >
                    What do you want to call this period?
                  </Typography>{' '}
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        data-testid="iEpochName"
                        placeholder="Gifting for the month of..."
                        fullWidth
                        sx={{}}
                        size="small"
                        color="secondary"
                        error={!!fieldState.error}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5, ml: 2, mt: 2 }}
                  >
                    Add a description for this period
                  </Typography>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        type="text"
                        size="small"
                        minRows="3"
                        fullWidth
                        placeholder="In this period, we will..."
                        multiline
                        color="secondary"
                        maxRows={5}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5, ml: 2, mt: 2 }}
                  >
                    How long will the gifting period last?
                  </Typography>
                  <Controller
                    name="duration"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        data-testid="iEpochDuration"
                        id="filled-hidden-label-normal"
                        fullWidth
                        sx={{}}
                        placeholder="Duration (in days)"
                        InputProps={{
                          inputProps: {
                            min: 1,
                          },
                        }}
                        type="number"
                        size="small"
                        color="secondary"
                        error={!!fieldState.error}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5, ml: 2, mt: 2 }}
                  >
                    What strategy will you use to allocate votes?
                  </Typography>
                  <Controller
                    name="strategy"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        {...field}
                        data-testid="aEpochStrategy"
                        options={['Normal voting', 'Quadratic voting']}
                        onChange={(event, newValue) => {
                          field.onChange(newValue);
                        }}
                        disableClearable
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            id="filled-hidden-label-normal"
                            fullWidth
                            sx={{}}
                            placeholder="Strategy"
                            size="small"
                            color="secondary"
                            error={!!fieldState.error}
                          />
                        )}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5, ml: 2, mt: 2 }}
                  >
                    What is the budget for this period?
                  </Typography>
                  <Box sx={{ flex: '1 1 auto' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Controller
                          name="budgetValue"
                          control={control}
                          rules={{ required: true, min: 0 }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              data-testid="iEpochBudgetValue"
                              id="filled-hidden-label-normal"
                              sx={{ mb: 2 }}
                              placeholder="Budget amount"
                              type="number"
                              size="small"
                              color="secondary"
                              error={!!fieldState.error}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={4}>
                        <Controller
                          name="budgetChain"
                          control={control}
                          defaultValue={chain}
                          render={({ field, fieldState }) => (
                            <Autocomplete
                              {...field}
                              data-testid="aEpochBudgetChain"
                              options={getFlattenedNetworks(
                                registry as Registry
                              )}
                              disableClearable
                              value={chain}
                              onChange={(event, newValue) => {
                                setChain(newValue as Chain);
                                const tokens = getFlattenedCurrencies(
                                  registry as Registry,
                                  newValue?.chainId as string
                                );
                                if (tokens.length > 0) setToken(tokens[0]);
                                else setToken({} as Token);
                              }}
                              getOptionLabel={(option) => option.name}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  id="filled-hidden-label-normal"
                                  placeholder="Network"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Controller
                          name="budgetToken"
                          control={control}
                          defaultValue={token}
                          render={({ field, fieldState }) => (
                            <Autocomplete
                              {...field}
                              data-testid="aEpochBudgetToken"
                              options={getFlattenedCurrencies(
                                registry as Registry,
                                chain.chainId
                              )}
                              value={token}
                              onChange={(event, newValue) => {
                                setToken(newValue as Token);
                              }}
                              disableClearable
                              getOptionLabel={(option) => option.symbol}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  id="filled-hidden-label-normal"
                                  placeholder="ETH"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <StyledAccordian disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      Members
                    </AccordionSummary>
                    <AccordionDetails>
                      <Table aria-label="simple table" size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox
                                inputProps={{
                                  'aria-label': 'select all desserts',
                                }}
                                color="default"
                                checked={isChecked.every(
                                  (elem) => elem === true
                                )}
                                onChange={(e) => {
                                  setIsChecked(
                                    Array(space.members.length).fill(
                                      e.target.checked
                                    )
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#99ccff' }}>
                              Username
                            </TableCell>
                            {strategy === 'Quadratic voting' ? (
                              <TableCell
                                align="right"
                                sx={{ color: '#99ccff' }}
                              >
                                Voting Allocation
                              </TableCell>
                            ) : (
                              <TableCell
                                align="right"
                                sx={{ color: '#99ccff' }}
                              >
                                Voting Weight
                              </TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {space.members?.map((member, index) => (
                            <TableRow
                              key={member}
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                component="th"
                                scope="row"
                                padding="checkbox"
                              >
                                <Checkbox
                                  color="secondary"
                                  inputProps={{
                                    'aria-label': 'select all desserts',
                                  }}
                                  checked={isChecked[index]}
                                  onClick={() => {
                                    toggleCheckboxValue(index);
                                  }}
                                />
                              </TableCell>
                              {isOpen && (
                                <TableCell align="right">
                                  {space.memberDetails[member].username}
                                </TableCell>
                              )}
                              <TableCell align="right">
                                <TextField
                                  id="filled-hidden-label-normal"
                                  value={allocations[index]}
                                  onChange={(event) => {
                                    handleAllocation(
                                      index,
                                      parseInt(event.target.value, 10)
                                    );
                                  }}
                                  size="small"
                                  type="number"
                                  sx={{ width: '50%' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </StyledAccordian>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      mt: 2,
                      borderRadius: 1,
                    }}
                  >
                    <PrimaryButton
                      data-testid="bStartEpoch"
                      variant="outlined"
                      type="submit"
                      color="secondary"
                      sx={{
                        width: '40%',
                      }}
                    >
                      Start
                    </PrimaryButton>
                    <Box sx={{ width: '25%' }} />
                    <PrimaryButton
                      data-testid="bAdvancedSettings"
                      type="submit"
                      color="secondary"
                      endIcon={
                        <NavigateNextIcon sx={{ color: 'text.primary' }} />
                      }
                      sx={{
                        ml: 2,
                        width: '35%',
                        fontSize: '0.8rem',
                      }}
                    >
                      Set advanced settings
                    </PrimaryButton>
                  </Box>
                </Box>
              </form>
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
}

export default CreateEpoch;
