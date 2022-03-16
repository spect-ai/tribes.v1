import styled from "@emotion/styled";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PrimaryButton } from "../../elements/styledComponents";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PaidIcon from "@mui/icons-material/Paid";
import {
  getEpochs,
  saveVotes,
  endEpoch,
  moveCards,
} from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { monthMap } from "../../../constants";
import { useBoard } from "../taskBoard";
import { notify, notifyError } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { registryTemp } from "../../../constants";
import PaymentModal, { BatchPayInfo } from "../payment";
import CsvExport from "./export";
import PayoutButton from "./payout";
import { updateTaskColumn, updateTaskStatus } from "../../../adapters/moralis";
import { BoardData, Column, Task } from "../../../types";
import NumericVoting, { Details } from "./numericVoting";
import ForAgainstVoting from "./forAgainstVoting";
import ZeroEpochs from "./zeroEpochs";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

type VotesGivenOneEpoch = {
  [key: string]: number;
};

type VotesGivenAllEpochs = {
  [key: string]: VotesGivenOneEpoch;
};

type VotesRemaining = {
  [key: string]: number;
};

const EpochList = ({ expanded, handleChange }: Props) => {
  const { Moralis, user } = useMoralis();
  const router = useRouter();
  const { data, setData, handleTabChange } = useBoard();
  const bid = router.query.bid as string;
  const [votesGiven, setVotesGiven] = useState({} as VotesGivenAllEpochs);
  const [votesRemaining, setVotesRemaining] = useState({} as VotesRemaining);
  const [isLoading, setIsLoading] = useState(false);
  const [passColumn, setPassColumn] = useState("");
  const [noPassColumn, setNoPassColumn] = useState("");
  const handleVotesGiven = (
    epochid: string,
    choiceId: string,
    value: number
  ) => {
    var temp = Object.assign({}, votesGiven); // Shallow copy
    temp[epochid][choiceId] = value;
    setVotesGiven(temp);
  };

  const handleVotesRemaining = (
    epochid: string,
    memberId: string,
    newVoteVal: number
  ) => {
    var tempReceived = Object.assign({}, votesRemaining); // Shallow copy
    tempReceived[epochid] =
      tempReceived[epochid] -
      newVoteVal ** 2 +
      votesGiven[epochid][memberId] ** 2;
    setVotesRemaining(tempReceived);
  };

  const handleEpochUpdateAfterSave = (index: number, newEpoch: Epoch) => {
    const temp = Object.assign({}, data);
    temp.epochs[index] = newEpoch;
    setData(temp);
  };

  const getDetails = (choices: Array<string>, type: string) => {
    var details = {} as Details;
    if (type === "Member") {
      for (var choice of choices) {
        details[choice] = { choice: data.memberDetails[choice].username };
      }
    } else if (type === "Card") {
      for (var choice of choices) {
        details[choice] = { choice: data.taskDetails[choice].title };
      }
    }
    return details;
  };

  const getChoices = (choices: Array<string>, active: boolean) => {
    return active ? choices.filter((ele: string) => ele !== user?.id) : choices;
  };

  useEffect(() => {
    setIsLoading(true);
    getEpochs(Moralis, bid)
      .then((res: any) => {
        setData(
          Object.assign(data, {
            epochs: res.epochs,
            taskDetails: res.taskDetails,
          })
        );
        var votesGivenByCaller = {} as VotesGivenAllEpochs;
        var votesRemainingByCaller = {} as VotesRemaining;
        for (var epoch of res.epochs) {
          votesGivenByCaller[epoch.objectId] = epoch.votesGivenByCaller;
          votesRemainingByCaller[epoch.objectId] = epoch.votesRemaining;
        }
        setVotesGiven(votesGivenByCaller);
        setVotesRemaining(votesRemainingByCaller);
        setIsLoading(false);
      })
      .catch((err: any) => {
        notifyError(`Sorry! There was an error while getting epochs.`);
        setIsLoading(false);
      });
  }, []);

  return (
    <Container>
      <Toaster />
      <Accordion hidden>
        <AccordionSummary />
      </Accordion>
      {!isLoading && (
        <>
          {data.epochs?.length === 0 ? (
            <ZeroEpochs />
          ) : (
            data.epochs?.map((epoch, index) => (
              <>
                {" "}
                {(Object.keys(epoch.memberStats).includes(user?.id as string) ||
                  data.roles[user?.id as string] === "admin") && (
                  <Accordion
                    disableGutters
                    key={index}
                    sx={{ border: "2px solid #00194A" }}
                  >
                    <AccordionSummary
                      aria-controls="panel1d-content"
                      id="panel1d-header"
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ backgroundColor: "#00194A" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Typography sx={{ width: "30%", flexShrink: 0 }}>
                          {epoch.name}
                        </Typography>
                        <Typography sx={{ width: "30%", flexShrink: 0 }}>
                          Started on{" "}
                          {
                            monthMap[
                              epoch.startTime.getMonth() as keyof typeof monthMap
                            ]
                          }{" "}
                          {epoch.startTime.getDate()}
                        </Typography>
                        <Typography sx={{ width: "30%", flexShrink: 0 }}>
                          {epoch.type}
                        </Typography>
                        {epoch.active && (
                          <Chip label="Ongoing" color="primary" />
                        )}
                        {epoch.paid && <Chip label="Paid" color="success" />}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: "#000f29" }}>
                      <Grid container>
                        <Grid item xs={8}>
                          {!isLoading &&
                            epoch.strategy === "Quadratic voting" &&
                            Object.keys(votesGiven).includes(
                              epoch.objectId
                            ) && (
                              <NumericVoting
                                epochId={epoch.objectId}
                                type={epoch.type}
                                active={epoch.active}
                                details={getDetails(epoch.choices, epoch.type)}
                                choices={getChoices(
                                  epoch.choices,
                                  epoch.active
                                )}
                                votesGiven={votesGiven[epoch.objectId]}
                                handleVotesGiven={handleVotesGiven}
                                votesRemaining={votesRemaining[epoch.objectId]}
                                handleVotesRemaining={handleVotesRemaining}
                                values={epoch.values}
                                tokenSymbol={epoch.token.symbol}
                              />
                            )}
                          {!isLoading &&
                            epoch.strategy === "Pass/No Pass" &&
                            Object.keys(votesGiven).includes(
                              epoch.objectId
                            ) && (
                              <ForAgainstVoting
                                epochId={epoch.objectId}
                                type={epoch.type}
                                active={epoch.active}
                                details={getDetails(epoch.choices, epoch.type)}
                                choices={getChoices(
                                  epoch.choices,
                                  epoch.active
                                )}
                                votesGiven={votesGiven[epoch.objectId]}
                                handleVotesGiven={handleVotesGiven}
                                votesAgainst={epoch.votesAgainst}
                                votesFor={epoch.votesFor}
                                isLoading={isLoading}
                                canVote={Object.keys(
                                  epoch.memberStats
                                ).includes(user?.id as string)}
                              />
                            )}
                        </Grid>
                        <Grid item xs={4}>
                          <DetailContainer>
                            {epoch.active && epoch.type === "Member" && (
                              <InfoContainer>
                                <Typography
                                  sx={{
                                    color: "#99ccff",
                                    textAlign: "right",
                                    fontSize: 14,
                                  }}
                                >
                                  Votes remaining
                                </Typography>
                                <Typography sx={{ textAlign: "right" }}>
                                  {votesRemaining[epoch.objectId]}
                                </Typography>
                              </InfoContainer>
                            )}
                            {epoch.budget && epoch.budget > 0 && (
                              <InfoContainer>
                                <Typography
                                  sx={{
                                    color: "#99ccff",
                                    textAlign: "right",
                                    fontSize: 14,
                                  }}
                                >
                                  Total Budget
                                </Typography>
                                <Typography sx={{ textAlign: "right" }}>
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
                                      disabled={
                                        votesRemaining[epoch.objectId] < 0
                                      }
                                      sx={{ mx: 4, borderRadius: 1 }}
                                      size="small"
                                      onClick={() => {
                                        setIsLoading(true);
                                        saveVotes(
                                          Moralis,
                                          epoch.objectId,
                                          votesGiven[epoch.objectId]
                                        )
                                          .then((res: any) => {
                                            setIsLoading(false);
                                            notify("Votes saved!");
                                          })
                                          .catch((err: any) => alert(err));
                                      }}
                                    >
                                      Save
                                    </PrimaryButton>
                                  )}
                                  {data.roles[user?.id as string] ===
                                    "admin" && (
                                    <PrimaryButton
                                      endIcon={<CloseIcon />}
                                      variant="outlined"
                                      size="small"
                                      sx={{ borderRadius: 1 }}
                                      loading={isLoading}
                                      onClick={() => {
                                        setIsLoading(true);
                                        endEpoch(Moralis, epoch.objectId)
                                          .then((res: any) => {
                                            handleEpochUpdateAfterSave(
                                              index,
                                              res
                                            );
                                            setIsLoading(false);
                                            notify("Epoch Ended!");
                                          })
                                          .catch((err: any) => {
                                            notifyError(
                                              `Sorry! There was an error while ending the epoch.`
                                            );
                                            setIsLoading(false);
                                          });
                                      }}
                                    >
                                      End Epoch
                                    </PrimaryButton>
                                  )}
                                  {/* )} */}
                                </ButtonContainer>{" "}
                              </>
                            ) : (
                              <ButtonContainer>
                                {epoch.type === "Member" ? (
                                  <PayoutButton epoch={epoch} />
                                ) : (
                                  <Box sx={{ alignItems: "center" }}>
                                    <Typography variant="body2">
                                      Move cards that passed to
                                    </Typography>
                                    <Autocomplete
                                      options={data.columnOrder}
                                      getOptionLabel={(option) =>
                                        option && data.columns[option].title
                                      }
                                      value={passColumn}
                                      onChange={(event, newValue) => {
                                        setPassColumn(newValue as string);
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          id="filled-hidden-label-normal"
                                          placeholder="Column"
                                          size="small"
                                          margin="dense"
                                        />
                                      )}
                                    />
                                    <Typography variant="body2">
                                      {`Move cards that didn't pass to`}
                                    </Typography>
                                    <Autocomplete
                                      options={data.columnOrder}
                                      getOptionLabel={(option) =>
                                        option && data.columns[option].title
                                      }
                                      value={noPassColumn}
                                      onChange={(event, newValue) => {
                                        setNoPassColumn(newValue as string);
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          id="filled-hidden-label-normal"
                                          placeholder="Column"
                                          size="small"
                                          margin="dense"
                                        />
                                      )}
                                    />
                                    <PrimaryButton
                                      endIcon={<PaidIcon />}
                                      variant="outlined"
                                      sx={{
                                        mx: 4,
                                        mt: 4,
                                        ml: 8,
                                        borderRadius: 1,
                                      }}
                                      size="small"
                                      onClick={() => {
                                        setIsLoading(true);
                                        moveCards(
                                          Moralis,
                                          epoch.objectId,
                                          passColumn,
                                          noPassColumn
                                        )
                                          .then((res: any) => {
                                            setData(res);
                                            handleTabChange({} as any, 0);
                                            setIsLoading(false);
                                          })
                                          .catch((err: any) => {
                                            notifyError(
                                              "Sorry! There was an error while moving cards."
                                            );
                                            setIsLoading(false);
                                          });
                                      }}
                                    >
                                      Move cards
                                    </PrimaryButton>
                                  </Box>
                                )}
                                {epoch.type === "Member" && (
                                  <CsvExport epoch={epoch} />
                                )}
                              </ButtonContainer>
                            )}
                          </DetailContainer>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}{" "}
              </>
            ))
          )}
        </>
      )}
    </Container>
  );
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

export default EpochList;
