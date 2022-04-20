import styled from '@emotion/styled';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Typography,
  Skeleton,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useMoralis } from 'react-moralis';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { Epoch } from '../../../types';
import { monthMap } from '../../../constants';
import { notify } from '../settingsTab';
import { PrimaryButton } from '../../elements/styledComponents';
import CsvExport from './export';
import NumericVoting, { Details } from './numericVoting';
import ForAgainstVoting from './forAgainstVoting';
import ZeroEpochs from './zeroEpochs';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import CreateEpoch from './createEpochModal';
import PayoutContributors from './payoutContributors';
import useMoralisFunction from '../../../hooks/useMoralisFunction';

type Props = {};

type VotesGivenOneEpoch = {
  [key: string]: number;
};

type VotesGivenAllEpochs = {
  [key: string]: VotesGivenOneEpoch;
};

type VotesRemaining = {
  [key: string]: number;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

function EpochList() {
  const { user } = useMoralis();
  const router = useRouter();
  const { space, setSpace, refreshEpochs, setRefreshEpochs } = useSpace();
  const bid = router.query.bid as string;
  const [votesGiven, setVotesGiven] = useState({} as VotesGivenAllEpochs);
  const [votesRemaining, setVotesRemaining] = useState({} as VotesRemaining);
  const [isLoading, setIsLoading] = useState(true);
  const { runMoralisFunction } = useMoralisFunction();

  const handleVotesGiven = (
    epochid: string,
    choiceId: string,
    value: number
  ) => {
    const temp = { ...votesGiven }; // Shallow copy
    temp[epochid][choiceId] = value;
    setVotesGiven(temp);
  };

  const handleVotesRemaining = (
    epochid: string,
    memberId: string,
    newVoteVal: number
  ) => {
    const tempReceived = { ...votesRemaining }; // Shallow copy
    tempReceived[epochid] =
      tempReceived[epochid] -
      newVoteVal ** 2 +
      votesGiven[epochid][memberId] ** 2;
    setVotesRemaining(tempReceived);
  };

  const handleEpochUpdateAfterSave = (index: number, newEpoch: Epoch) => {
    const temp = { ...space };
    temp.epochs[index] = newEpoch;
    setSpace(temp);
  };

  const getDetails = (choices: Array<string>, type: string) => {
    const details = {} as Details;
    if (type === 'Member') {
      for (let i = 0; i < choices.length; i += 1) {
        details[choices[i]] = {
          choice: space.memberDetails[choices[i]].username,
        };
      }
    } else if (type === 'Card') {
      for (let i = 0; i < choices.length; i += 1) {
        details[choices[i]] = {
          choice: space.taskDetails[choices[i]].title,
        };
      }
    }
    return details;
  };

  const getChoices = (choices: Array<string>, active: boolean) => {
    return active ? choices.filter((ele: string) => ele !== user?.id) : choices;
  };

  const loadEpochs = () => {
    runMoralisFunction('getEpochs', { spaceId: bid })
      .then((res: any) => {
        setSpace(
          Object.assign(space, {
            epochs: res.epochs,
            taskDetails: res.taskDetails,
          })
        );
        const votesGivenByCaller = {} as VotesGivenAllEpochs;
        const votesRemainingByCaller = {} as VotesRemaining;
        for (let i = 0; i < res.epochs.length; i += 1) {
          votesGivenByCaller[res.epochs[i].objectId] =
            res.epochs[i].votesGivenByCaller;
          votesRemainingByCaller[res.epochs[i].objectId] =
            res.epochs[i].votesRemaining;
        }
        setVotesGiven(votesGivenByCaller);
        setVotesRemaining(votesRemainingByCaller);
        setIsLoading(false);
      })
      .catch((err: any) => {
        notify(`Sorry! There was an error while getting epochs.`, 'error');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (refreshEpochs) {
      setIsLoading(true);
      loadEpochs();
      setRefreshEpochs(false);
    }
  }, [refreshEpochs]);
  useEffect(() => {
    setIsLoading(true);
    loadEpochs();
    setRefreshEpochs(false);
  }, []);
  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        animation="wave"
        sx={{ mt: 8 }}
      />
    );
  }

  return (
    <Container>
      <Toaster />
      <Box sx={{ width: '20%' }}>
        {space.epochs?.length !== 0 && <CreateEpoch />}
      </Box>
      <Accordion hidden>
        <AccordionSummary />
      </Accordion>
      {space.epochs?.length === 0 ? (
        <ZeroEpochs />
      ) : (
        space.epochs?.map((epoch, index) => (
          <>
            {' '}
            {(Object.keys(epoch.memberStats).includes(user?.id as string) ||
              space.roles[user?.id as string] === 3) && (
              <Accordion
                disableGutters
                key={epoch.objectId}
                sx={{ border: '2px solid #00194A' }}
              >
                <AccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ backgroundColor: '#00194A' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Typography sx={{ width: '30%', flexShrink: 0 }}>
                      {epoch.name}
                    </Typography>
                    <Typography sx={{ width: '30%', flexShrink: 0 }}>
                      Started on{' '}
                      {
                        monthMap[
                          epoch.startTime.getMonth() as keyof typeof monthMap
                        ]
                      }{' '}
                      {epoch.startTime.getDate()}
                    </Typography>
                    <Typography sx={{ width: '30%', flexShrink: 0 }}>
                      {epoch.type}
                    </Typography>
                    {epoch.active && <Chip label="Ongoing" color="primary" />}
                    {epoch.paid && <Chip label="Paid" color="success" />}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#000f29' }}>
                  <Grid container>
                    <Grid item xs={8}>
                      {!isLoading &&
                        epoch.strategy === 'Quadratic voting' &&
                        Object.keys(votesGiven).includes(epoch.objectId) && (
                          <NumericVoting
                            epochId={epoch.objectId}
                            type={epoch.type}
                            active={epoch.active}
                            details={getDetails(epoch.choices, epoch.type)}
                            choices={getChoices(epoch.choices, epoch.active)}
                            votesGiven={votesGiven[epoch.objectId]}
                            handleVotesGiven={handleVotesGiven}
                            votesRemaining={votesRemaining[epoch.objectId]}
                            handleVotesRemaining={handleVotesRemaining}
                            values={epoch.values}
                            tokenSymbol={epoch.token.symbol}
                          />
                        )}
                      {!isLoading &&
                        epoch.strategy === 'Pass/No Pass' &&
                        Object.keys(votesGiven).includes(epoch.objectId) && (
                          <ForAgainstVoting
                            epochId={epoch.objectId}
                            type={epoch.type}
                            active={epoch.active}
                            details={getDetails(epoch.choices, epoch.type)}
                            choices={getChoices(epoch.choices, epoch.active)}
                            votesGiven={votesGiven[epoch.objectId]}
                            handleVotesGiven={handleVotesGiven}
                            votesAgainst={epoch.votesAgainst}
                            votesFor={epoch.votesFor}
                            isLoading={isLoading}
                            canVote={Object.keys(epoch.memberStats).includes(
                              user?.id as string
                            )}
                          />
                        )}
                    </Grid>
                    <Grid item xs={4}>
                      <DetailContainer>
                        {epoch.active && epoch.type === 'Member' && (
                          <InfoContainer>
                            <Typography
                              sx={{
                                color: '#99ccff',
                                textAlign: 'right',
                                fontSize: 14,
                              }}
                            >
                              Votes remaining
                            </Typography>
                            <Typography sx={{ textAlign: 'right' }}>
                              {votesRemaining[epoch.objectId]}
                            </Typography>
                          </InfoContainer>
                        )}
                        {epoch.budget && epoch.budget > 0 && (
                          <InfoContainer>
                            <Typography
                              sx={{
                                color: '#99ccff',
                                textAlign: 'right',
                                fontSize: 14,
                              }}
                            >
                              Total Budget
                            </Typography>
                            <Typography sx={{ textAlign: 'right' }}>
                              {epoch.budget} {epoch.token.symbol}
                            </Typography>
                          </InfoContainer>
                        )}
                        {epoch.active ? (
                          <>
                            <ButtonContainer>
                              {Object.keys(epoch.memberStats).includes(
                                user?.id as string
                              ) && (
                                <PrimaryButton
                                  endIcon={<SaveIcon />}
                                  loading={isLoading}
                                  variant="outlined"
                                  disabled={votesRemaining[epoch.objectId] < 0}
                                  sx={{ mx: 4, borderRadius: 1 }}
                                  size="small"
                                  color="secondary"
                                  onClick={() => {
                                    setIsLoading(true);
                                    runMoralisFunction('saveVotes', {
                                      epochId: epoch.objectId,
                                      votesGiven: votesGiven[epoch.objectId],
                                    })
                                      .then((res: any) => {
                                        setIsLoading(false);
                                        notify('Votes saved!');
                                      })
                                      .catch((err: any) => alert(err));
                                  }}
                                >
                                  Save
                                </PrimaryButton>
                              )}
                              {space.roles[user?.id as string] === 3 && (
                                <PrimaryButton
                                  endIcon={<CloseIcon />}
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  sx={{ borderRadius: 1 }}
                                  loading={isLoading}
                                  onClick={() => {
                                    setIsLoading(true);
                                    runMoralisFunction('endEpoch', {
                                      epochId: epoch.objectId,
                                    })
                                      .then((res: any) => {
                                        handleEpochUpdateAfterSave(index, res);
                                        setIsLoading(false);
                                        notify('Epoch Ended!');
                                      })
                                      .catch((err: any) => {
                                        notify(
                                          `Sorry! There was an error while ending the epoch.`,
                                          'error'
                                        );
                                        setIsLoading(false);
                                      });
                                  }}
                                >
                                  End Epoch
                                </PrimaryButton>
                              )}
                              {/* )} */}
                            </ButtonContainer>{' '}
                          </>
                        ) : (
                          <ButtonContainer>
                            {epoch.type === 'Member' ? (
                              <PayoutContributors epoch={epoch} />
                            ) : (
                              <div />
                            )}
                            {epoch.type === 'Member' && (
                              <CsvExport epoch={epoch} />
                            )}
                          </ButtonContainer>
                        )}
                      </DetailContainer>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}{' '}
          </>
        ))
      )}
    </Container>
  );
}

export default EpochList;
