import styled from "@emotion/styled";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PrimaryButton } from "../../elements/styledComponents";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PaidIcon from "@mui/icons-material/Paid";
import { getEpochs, saveVotes, endEpoch } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { monthMap } from "../../../constants";
import { useBoard } from "../taskBoard";
import { downloadCSV } from "../../../utils/utils";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { registryTemp } from "../../../constants";
import PaymentModal, { BatchPayInfo } from "../payment";
import CsvExport from "./export";
import PayoutButton from "./payout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { updateTaskColumn, updateTaskStatus } from "../../../adapters/moralis";
import { BoardData, Column, Task } from "../../../types";

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
  const [steps, setSteps] = useState([] as string[]);
  const [activeStep, setActiveStep] = useState(0);
  const [batchPayMetadata, setBatchPayMetadata] = useState({} as BatchPayInfo);
  const [isOpen, setIsOpen] = useState(false);
  console.log(votesGiven);
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

  useEffect(() => {
    setIsLoading(true);
    getEpochs(Moralis, bid)
      .then((res: any) => {
        console.log(res);
        setData(
          Object.assign(data, {
            epochs: res.epochs,
            taskDetails: res.taskDetails,
          })
        );
        console.log(`data`);

        console.log(data);
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
        console.log("hehe");
        alert(err);
      });
  }, []);

  return (
    <Container>
      <Toaster />
      <Accordion hidden>
        <AccordionSummary />
      </Accordion>
      {data.epochs?.map((epoch, index) => (
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
                {monthMap[epoch.startTime.getMonth() as keyof typeof monthMap]}{" "}
                {epoch.startTime.getDate()}
              </Typography>
              <Typography sx={{ width: "30%", flexShrink: 0 }}>
                {epoch.type}
              </Typography>
              {epoch.active && <Chip label="Ongoing" color="primary" />}
              {epoch.paid && <Chip label="Paid" color="success" />}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: "#000f29" }}>
            <Grid container>
              <Grid item xs={8}>
                <TableContainer>
                  <Table aria-label="simple table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#99ccff" }}>
                          {epoch.type === "Member" ? "Member" : "Card"}
                        </TableCell>
                        {epoch.strategy === "Quadratic voting" && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Votes Given
                          </TableCell>
                        )}

                        {epoch.active === false &&
                          epoch.strategy === "Quadratic voting" && (
                            <TableCell align="right" sx={{ color: "#99ccff" }}>
                              Value
                            </TableCell>
                          )}
                        {epoch.strategy === "Pass/No Pass" && epoch.active && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Pass / No Pass
                          </TableCell>
                        )}
                        {epoch.strategy === "Pass/No Pass" && !epoch.active && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Pass Votes
                          </TableCell>
                        )}
                        {epoch.strategy === "Pass/No Pass" && !epoch.active && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            No Pass Votes
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {epoch.active
                        ? epoch.choices
                            .filter((ele: string) => ele !== user?.id)
                            .map((choice, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell component="th" scope="row">
                                  {epoch.type === "Member"
                                    ? data.memberDetails[choice].username
                                    : data.taskDetails[choice].title}
                                </TableCell>
                                {!isLoading &&
                                  epoch.strategy === "Quadratic voting" && (
                                    <TableCell align="right">
                                      {Object.keys(votesGiven).includes(
                                        epoch.objectId
                                      ) && (
                                        <TextField
                                          id="filled-hidden-label-normal"
                                          value={
                                            votesGiven[epoch.objectId][choice]
                                          }
                                          type="number"
                                          placeholder="Value"
                                          inputProps={{
                                            readOnly: !epoch.active,
                                          }}
                                          size="small"
                                          error={
                                            votesRemaining[epoch.objectId] < 0
                                          }
                                          sx={{ width: "30%" }}
                                          onChange={(event) => {
                                            handleVotesRemaining(
                                              epoch.objectId,
                                              choice,
                                              parseInt(event.target.value)
                                            );
                                            handleVotesGiven(
                                              epoch.objectId,
                                              choice,
                                              parseInt(event.target.value)
                                            );
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                  )}
                                {!isLoading &&
                                  epoch.strategy === "Pass/No Pass" &&
                                  Object.keys(votesGiven).includes(
                                    epoch.objectId
                                  ) && (
                                    <TableCell align="right">
                                      <PrimaryButton
                                        endIcon={<CheckCircleIcon />}
                                        loading={isLoading}
                                        sx={{
                                          color:
                                            votesGiven[epoch.objectId][
                                              choice
                                            ] === 1
                                              ? "#66bb6a"
                                              : "primary.main",
                                        }}
                                        size="medium"
                                        onClick={() => {
                                          handleVotesGiven(
                                            epoch.objectId,
                                            choice,
                                            1
                                          );
                                        }}
                                      />

                                      <PrimaryButton
                                        endIcon={<CancelIcon />}
                                        loading={isLoading}
                                        sx={{
                                          color:
                                            votesGiven[epoch.objectId][
                                              choice
                                            ] === -1
                                              ? "#f44336"
                                              : "primary.main",
                                        }}
                                        size="medium"
                                        onClick={() => {
                                          handleVotesGiven(
                                            epoch.objectId,
                                            choice,
                                            -1
                                          );
                                        }}
                                      />
                                    </TableCell>
                                  )}
                              </TableRow>
                            ))
                        : epoch.choices.map((choice, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {epoch.type === "Member"
                                  ? data.memberDetails[choice].username
                                  : data.taskDetails[choice].title}
                              </TableCell>
                              {!isLoading &&
                                epoch.strategy === "Quadratic voting" && (
                                  <TableCell align="right">
                                    {Object.keys(votesGiven).includes(
                                      epoch.objectId
                                    ) && (
                                      <TextField
                                        id="filled-hidden-label-normal"
                                        value={
                                          votesGiven[epoch.objectId][choice]
                                        }
                                        type="number"
                                        placeholder="Value"
                                        inputProps={{
                                          readOnly: !epoch.active,
                                        }}
                                        size="small"
                                        error={
                                          votesRemaining[epoch.objectId] < 0
                                        }
                                        sx={{ width: "30%" }}
                                        onChange={(event) => {
                                          handleVotesRemaining(
                                            epoch.objectId,
                                            choice,
                                            parseInt(event.target.value)
                                          );
                                          handleVotesGiven(
                                            epoch.objectId,
                                            choice,
                                            parseInt(event.target.value)
                                          );
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                )}

                              {epoch.strategy === "Quadratic voting" && (
                                <TableCell align="right">
                                  {choice in epoch.values &&
                                  epoch.values[choice]
                                    ? epoch.values[choice].toFixed(2)
                                    : 0}{" "}
                                  {epoch.token.symbol}
                                </TableCell>
                              )}
                              {epoch.strategy === "Pass/No Pass" && (
                                <TableCell align="right">
                                  {choice in epoch.votesFor &&
                                  epoch.votesFor[choice]
                                    ? epoch.votesFor[choice]
                                    : 0}{" "}
                                </TableCell>
                              )}
                              {epoch.strategy === "Pass/No Pass" && (
                                <TableCell align="right">
                                  {choice in epoch.votesAgainst &&
                                  epoch.votesAgainst[choice]
                                    ? epoch.votesAgainst[choice]
                                    : 0}{" "}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                    <ButtonContainer>
                      <PrimaryButton
                        endIcon={<SaveIcon />}
                        loading={isLoading}
                        variant="outlined"
                        disabled={votesRemaining[epoch.objectId] < 0}
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
                      {/* {data.access === "admin" && ( */}
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
                              handleEpochUpdateAfterSave(index, res);
                              setIsLoading(false);
                              notify("Epoch Ended!");
                            })
                            .catch((err: any) => alert(err));
                        }}
                      >
                        End Epoch
                      </PrimaryButton>
                      {/* )} */}
                    </ButtonContainer>
                  ) : (
                    <ButtonContainer>
                      {epoch.type === "Member" ? (
                        <PayoutButton epoch={epoch} />
                      ) : (
                        <PrimaryButton
                          endIcon={<PaidIcon />}
                          variant="outlined"
                          sx={{ mx: 4, borderRadius: 1 }}
                          size="small"
                          onClick={() => {
                            setIsLoading(true);
                            for (var choice of epoch.choices) {
                              if (
                                epoch.votesFor[choice] >
                                epoch.votesAgainst[choice]
                              ) {
                                updateTaskColumn(
                                  Moralis,
                                  epoch.spaceId,
                                  choice,
                                  data.columnOrder[0],
                                  data.columnOrder[1]
                                ).then((res: BoardData) => {
                                  setData(res);
                                  setIsLoading(false);
                                });
                              }
                            }
                          }}
                        >
                          Move cards
                        </PrimaryButton>
                      )}
                      <CsvExport epoch={epoch} />
                    </ButtonContainer>
                  )}
                </DetailContainer>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
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
