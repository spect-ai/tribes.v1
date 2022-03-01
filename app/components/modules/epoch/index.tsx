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
import DownloadIcon from "@mui/icons-material/Download";
import { getEpochs } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { monthMap } from "../../../constants";
import { useBoard } from "../taskBoard";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

function createData(
  epochId: string,
  epochType: string,
  date: string,
  active: boolean,
  data: {
    name: string;
    value: number;
    votes: number;
  }[]
) {
  return {
    epochId,
    epochType,
    date,
    active,
    data,
  };
}

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
  const { Moralis } = useMoralis();
  const router = useRouter();
  const { data, setData } = useBoard();
  const bid = router.query.bid as string;
  const [epochs, setEpochs] = useState([] as Epoch[]);
  const [votesGiven, setVotesGiven] = useState({} as VotesGivenAllEpochs);
  const [votesRemaining, setVotesRemaining] = useState({} as VotesRemaining);
  const [isLoading, setIsLoading] = useState(false);

  const handleVotesGiven = (
    epochid: string,
    memberId: string,
    value: number
  ) => {
    var temp = Object.assign({}, votesGiven);
    temp[epochid][memberId] = value;
    setVotesGiven(temp);
  };
  useEffect(() => {
    setIsLoading(true);
    getEpochs(Moralis, bid)
      .then((res: any) => {
        console.log(res);
        setEpochs(res);
        for (var epoch of res) {
          votesGiven[epoch.objectId] = epoch.votesGivenByCaller;
          votesRemaining[epoch.objectId] = epoch.votesRemaining;
        }

        setIsLoading(false);
      })
      .catch((err: any) => alert(err));
  }, []);

  return (
    <Container>
      <Accordion hidden>
        <AccordionSummary />
      </Accordion>
      {epochs.map((epoch, index) => (
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
                Started on {monthMap[epoch.startTime.getMonth()]}{" "}
                {epoch.startTime.getDate()}
              </Typography>
              <Typography sx={{ width: "30%", flexShrink: 0 }}>
                {epoch.type}
              </Typography>
              {epoch.active && <Chip label="Ongoing" color="primary" />}
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
                          {epoch.type === "Contribution"
                            ? "Contributor"
                            : "Task"}
                        </TableCell>
                        {epoch.active === true && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Votes Given
                          </TableCell>
                        )}
                        {data.access === "admin" && epoch.active === false && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Value
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {epoch.members.map((member, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {data.memberDetails[member.objectId].username}
                          </TableCell>
                          {epoch.active === true && !isLoading && (
                            <TableCell align="right">
                              <TextField
                                id="filled-hidden-label-normal"
                                value={
                                  votesGiven[epoch.objectId][member.objectId]
                                }
                                type="number"
                                placeholder="Value"
                                size="small"
                                onChange={(event) => {
                                  handleVotesGiven(
                                    epoch.objectId,
                                    member.objectId,
                                    parseInt(event.target.value)
                                  );
                                }}
                              />
                            </TableCell>
                          )}
                          {data.access === "admin" &&
                            epoch.active === false && (
                              <TableCell align="right">
                                {member.value}
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
                  <InfoContainer>
                    <Typography
                      sx={{
                        color: "#99ccff",
                        textAlign: "right",
                        fontSize: 14,
                      }}
                    >
                      Budget
                    </Typography>
                    <Typography sx={{ textAlign: "right" }}>
                      {epoch.budget} {epoch.token.symbol}
                    </Typography>
                  </InfoContainer>
                  {epoch.active ? (
                    <ButtonContainer>
                      <PrimaryButton
                        endIcon={<SaveIcon />}
                        variant="outlined"
                        sx={{ mx: 4 }}
                        size="small"
                      >
                        Save
                      </PrimaryButton>
                      <PrimaryButton
                        endIcon={<CloseIcon />}
                        variant="outlined"
                        size="small"
                      >
                        End Epoch
                      </PrimaryButton>
                    </ButtonContainer>
                  ) : (
                    <ButtonContainer>
                      <PrimaryButton
                        endIcon={<DownloadIcon />}
                        variant="outlined"
                        size="small"
                      >
                        Export to csv
                      </PrimaryButton>
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
