import {
  TableCell,
  TableRow,
  TextField,
  TableHead,
  TableBody,
  TableContainer,
  Table,
} from "@mui/material";
import React, { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { PrimaryButton } from "../../elements/styledComponents";

type Choice = {
  choice: string;
};

export type Details = {
  [choiceId: string]: Choice;
};

export type Votes = {
  [choiceId: string]: Number;
};

type Props = {
  epochId: string;
  type: string;
  active: boolean;
  details: Details;
  choices: Array<string>;
  votesGiven: VotesGivenOneEpoch;
  handleVotesGiven: Function;
  isLoading: boolean;
  votesFor: Votes;
  votesAgainst: Votes;
};

type VotesGivenOneEpoch = {
  [key: string]: number;
};

const ForAgainstVoting = ({
  epochId,
  type,
  active,
  details,
  choices,
  votesGiven,
  handleVotesGiven,
  votesFor,
  votesAgainst,
  isLoading,
}: Props) => {
  console.log(votesGiven);
  const [loading, setLoading] = useState(isLoading);
  return (
    <TableContainer>
      <Table aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#99ccff" }}>
              {type === "Member" ? "Member" : "Card"}
            </TableCell>

            {active && (
              <TableCell align="right" sx={{ color: "#99ccff" }}>
                For
              </TableCell>
            )}
            {active && (
              <TableCell align="right" sx={{ color: "#99ccff" }}>
                Against
              </TableCell>
            )}
            {!active && (
              <TableCell align="right" sx={{ color: "#99ccff" }}>
                Votes For
              </TableCell>
            )}
            {!active && (
              <TableCell align="right" sx={{ color: "#99ccff" }}>
                Votes Against
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {choices.map((choiceId, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-child td, &:last-child th": {
                  border: 0,
                },
              }}
            >
              <TableCell component="th" scope="row">
                {details[choiceId].choice}
              </TableCell>
              {active && (
                <TableCell align="right">
                  <PrimaryButton
                    endIcon={<CheckCircleIcon />}
                    loading={loading}
                    sx={{
                      pl: 8,

                      color:
                        votesGiven[choiceId] === 1 ? "#66bb6a" : "primary.main",
                    }}
                    size="medium"
                    onClick={() => {
                      handleVotesGiven(epochId, choiceId, 1);
                    }}
                  />
                </TableCell>
              )}
              {active && (
                <TableCell align="right">
                  <PrimaryButton
                    endIcon={<CancelIcon />}
                    loading={loading}
                    sx={{
                      pl: 4,
                      color:
                        votesGiven[choiceId] === -1
                          ? "#f44336"
                          : "primary.main",
                    }}
                    size="medium"
                    onClick={() => {
                      handleVotesGiven(epochId, choiceId, -1);
                    }}
                  />{" "}
                </TableCell>
              )}

              {!active && (
                <TableCell align="right">
                  {choiceId in votesFor && votesFor[choiceId]
                    ? votesFor[choiceId]
                    : 0}{" "}
                </TableCell>
              )}
              {!active && (
                <TableCell align="right">
                  {choiceId in votesAgainst && votesAgainst[choiceId]
                    ? votesAgainst[choiceId]
                    : 0}{" "}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ForAgainstVoting;
