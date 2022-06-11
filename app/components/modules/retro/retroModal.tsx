import CloseIcon from '@mui/icons-material/Close';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Fade,
  Grid,
  IconButton,
  InputBase,
  Link,
  Modal,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import usePeriod from '../../../hooks/usePeriod';
import { Epoch } from '../../../types';
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import Choices from './choices';
import OptionsPopover from './optionsPopover';
import SkeletonLoader from './skeletonLoader';
import ConfirmModal from '../../elements/confirmModal';
import CsvExport from './export';
import PayoutContributors from './payoutContributors';
import Feedback from './feedback';
import useAccess from '../../../hooks/useAccess';

interface SingleRetroContextType {
  period: Epoch;
  setPeriod: (periods: Epoch) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  votesGiven: any;
  setVotesGiven: (votesGiven: any) => void;
  votesRemaining: any;
  setVotesRemaining: (votesRemaining: any) => void;
  feedbackReceived: any;
  setFeedbackReceived: (feedbackReceived: any) => void;
  feedbackGiven: any;
  choices: string[];
  setFeedbackGiven: (feedbackGiven: any) => void;
  handleFeedbackUpdate: Function;
  handleVotesUpdate: Function;
  handlePeriodUpdate: Function;
}

const SingleRetroContext = createContext<SingleRetroContextType>(
  {} as SingleRetroContextType
);

function useProviderSingleRetro() {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<Epoch>({} as Epoch);
  const [name, setName] = useState(period?.name || '');
  const [description, setDescription] = useState(period?.description || '');
  const [votesGiven, setVotesGiven] = useState({} as any);
  const [votesRemaining, setVotesRemaining] = useState(0);
  const [feedbackReceived, setFeedbackReceived] = useState({} as any);
  const [feedbackGiven, setFeedbackGiven] = useState({} as any);
  const [choices, setChoices] = useState(period?.choices || []);

  const handlePeriodUpdate = (newPeriod: Epoch) => {
    setPeriod(newPeriod);
  };

  const handleFeedbackUpdate = (memberId: string, feedback: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp = { ...feedbackGiven }; // Shallow copy
    temp[memberId] = feedback;
    setFeedbackGiven(temp);
  };

  const handleVotesUpdate = (choiceId: string, vote: number) => {
    const val = vote || 0;
    const votesObj = {} as any;
    votesObj[choiceId] = val;
    if (period.strategy?.toUpperCase() === 'QUADRATIC VOTING') {
      setVotesRemaining(votesRemaining - val ** 2 + votesGiven[choiceId] ** 2);
    } else if (period.strategy?.toUpperCase() === 'NORMAL VOTING') {
      setVotesRemaining(votesRemaining - val + votesGiven[choiceId]);
    }
    const temp = { ...votesGiven }; // Shallow copy
    temp[choiceId] = val;
    setVotesGiven(temp);
  };

  useEffect(() => {
    if (period && Object.keys(period)?.length !== 0) {
      console.log(period);
      setIsLoading(true);
      setName(period.name);
      setDescription(period.description);
      setVotesGiven(period.votesGivenByCaller);
      setVotesRemaining(period.votesRemaining);
      setFeedbackReceived(period.feedbackReceived);
      setFeedbackGiven(period.feedbackGiven);
      setChoices(period.choices);
      setIsLoading(false);
    }
  }, [period]);

  return {
    isLoading,
    setIsLoading,
    period,
    setPeriod,
    name,
    setName,
    description,
    setDescription,
    votesGiven,
    setVotesGiven,
    votesRemaining,
    setVotesRemaining,
    feedbackReceived,
    setFeedbackReceived,
    feedbackGiven,
    setFeedbackGiven,
    handleFeedbackUpdate,
    handleVotesUpdate,
    choices,
    handlePeriodUpdate,
  };
}

export const useSingleRetro = () => useContext(SingleRetroContext);

export const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #fff',
  borderRadius: '1rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: theme.palette.background.default,
  padding: '1rem 2rem',
  [theme.breakpoints.down('md')]: {
    top: '50%',
    left: '50%',
    width: '80%',
    height: '76%',
  },
  [theme.breakpoints.up('md')]: {
    width: '88%',
    height: '85%',
    top: '50%',
    left: '50%',
  },
  [theme.breakpoints.up('lg')]: {
    width: '93%',
    height: '91%',
    top: '50%',
    left: '50%',
  },
}));

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  openPeriod: Epoch;
};

function RetroModal({ handleClose, isOpen, openPeriod }: Props) {
  const { space } = useSpace();
  const { tribe } = useTribe();
  const context = useProviderSingleRetro();
  const {
    isLoading,
    setIsLoading,
    period,
    setPeriod,
    name,
    setName,
    description,
    setDescription,
  } = context;
  const { endRetroPeriod } = usePeriod();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { isSpaceSteward } = useAccess();

  const {
    state: { registry },
  } = useGlobal();
  const [tab, setTab] = useState(0);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const handleConfirmEnd = () => {
    endRetroPeriod(period.objectId);
    handleClose();
  };

  useEffect(() => {
    if (isOpen && openPeriod) {
      setIsLoading(true);
      console.log(openPeriod);
      setPeriod(openPeriod);
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <SingleRetroContext.Provider value={context}>
      <Modal open={isOpen} onClose={handleClose}>
        <ModalContainer id="cardModal">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <Fade in={!isLoading}>
              <Box sx={{ height: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: '2rem',
                    color: '#808080',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: '1rem',
                  }}
                >
                  <Breadcrumbs aria-label="breadcrumb">
                    <Link
                      underline="hover"
                      color="inherit"
                      href={`/tribe/${space.team[0].teamId}`}
                    >
                      {space.team[0].name}
                    </Link>
                    <Link
                      underline="hover"
                      color="inherit"
                      href={`/tribe/${space.team[0].teamId}/space/${space.objectId}`}
                    >
                      {space.name}
                    </Link>
                    <Link
                      underline="hover"
                      color="text.primary"
                      href={`/tribe/${space.team[0].teamId}/space/${space.objectId}`}
                      aria-current="page"
                    >
                      {`Retro period #${period.epochNumber}`}
                    </Link>
                  </Breadcrumbs>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <IconButton
                    data-testid="bCloseButton"
                    sx={{
                      height: '2.5rem',
                    }}
                    onClick={handleClose}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  <Grid
                    item
                    xs={8}
                    sx={{
                      height: '90%',
                      borderRight: 1,
                      borderColor: 'text.secondary',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '90%',
                        height: '40%',
                        pr: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          width: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <InputBase
                            placeholder="Add Title..."
                            sx={{
                              fontSize: '30px',
                              width: '85%',
                            }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            // onBlur={() => updateTitle()}
                            // readOnly={
                            //   !(task?.access?.creator || task?.access?.reviewer)
                            // }
                            multiline
                            maxRows={3}
                          />
                          <Box sx={{ flex: '1 1 auto' }} />
                          <OptionsPopover
                            period={period}
                            handleModalClose={handleClose}
                          />
                        </Box>
                        {period.budget && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'start',
                              justifyContent: 'start',
                            }}
                          >
                            <Avatar
                              src={registry[period.chain.chainId]?.pictureUrl}
                              sx={{
                                width: '1rem',
                                height: '1rem',
                                objectFit: 'cover',
                                my: 1,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.primary"
                              sx={{ ml: 2, fontSize: 14 }}
                            >
                              {`${period.budget}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.primary"
                              sx={{ ml: 2, fontSize: 14 }}
                            >
                              {`${period.token.symbol}`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <TextField
                        sx={{ border: 0, mt: 6 }}
                        placeholder="Lets retro..."
                        multiline
                        fullWidth
                        rows={8}
                        onChange={(event) => {
                          setDescription(event.target.value);
                        }}
                        defaultValue={description}
                        InputProps={{
                          disableUnderline: true,
                        }}
                      />
                    </Box>
                    <Box sx={{ width: '80%', mt: 8 }}>
                      <StyledTabs
                        value={tab}
                        onChange={() => {}}
                        sx={{ ml: '1rem', borderRadius: '0.5rem' }}
                      >
                        {period.active ? (
                          <StyledTab label="Members" />
                        ) : (
                          <StyledTab label="Feedback" />
                        )}
                      </StyledTabs>
                      {period.active ? <Choices /> : <Feedback />}
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        justifyContent: 'start',
                        width: '100%',
                      }}
                    >
                      {period.active && isSpaceSteward() && (
                        <PrimaryButton
                          data-testid="bEndRetroButton"
                          loading={isLoading}
                          sx={{
                            borderRadius: '3px',
                            mx: '2rem',
                            width: '12rem',
                          }}
                          onClick={() => {
                            setIsConfirmOpen(true);
                          }}
                          variant="outlined"
                          id="bEndRetro"
                          color="secondary"
                          fullWidth
                        >
                          End Retro Period
                        </PrimaryButton>
                      )}
                      {!period.active && isSpaceSteward() && period.values && (
                        <PayoutContributors />
                      )}
                      {!period.active && isSpaceSteward() && <CsvExport />}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </ModalContainer>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmOpen}
        handleClose={handleConfirmClose}
        buttonText="Yes, end retro period"
        runOnConfirm={handleConfirmEnd}
        modalContent={
          <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
            Are you sure you want to end this retro period?
          </Typography>
        }
      />
    </SingleRetroContext.Provider>
  );
}

export default RetroModal;
