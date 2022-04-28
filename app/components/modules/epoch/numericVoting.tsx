import {
  TableCell,
  TableRow,
  TextField,
  TableHead,
  TableBody,
  TableContainer,
  Table,
} from '@mui/material';
import React from 'react';

type Choice = {
  choice: string;
};

export type Details = {
  [choiceId: string]: Choice;
};

export type Values = {
  [choiceId: string]: Number;
};

type VotesGivenOneEpoch = {
  [key: string]: number;
};

type Props = {
  epochId: string;
  type: string;
  active: boolean;
  details: Details;
  choices: Array<string>;
  votesGiven: VotesGivenOneEpoch;
  handleVotesGiven: Function;
  votesRemaining: number;
  handleVotesRemaining: Function;
  values: Values;
  tokenSymbol: string;
};

function NumericVoting({
  epochId,
  type,
  active,
  details,
  choices,
  votesGiven,
  handleVotesGiven,
  votesRemaining,
  handleVotesRemaining,
  values,
  tokenSymbol,
}: Props) {
  return (
    <TableContainer>
      <Table aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#99ccff' }}>
              {type === 'Member' ? 'Member' : 'Card'}
            </TableCell>
            <TableCell align="right" sx={{ color: '#99ccff' }}>
              Votes Given
            </TableCell>
            {!active && (
              <TableCell align="right" sx={{ color: '#99ccff' }}>
                Value
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {choices.map((choiceId, index) => (
            <TableRow
              key={choiceId}
              sx={{
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              }}
            >
              <TableCell component="th" scope="row">
                {details[choiceId].choice}
              </TableCell>
              <TableCell align="right">
                {votesGiven && (
                  <TextField
                    data-testid={`iVote${index}`}
                    id="filled-hidden-label-normal"
                    value={votesGiven[choiceId]}
                    type="number"
                    placeholder="Value"
                    inputProps={{
                      readOnly: !active,
                      min: 0,
                    }}
                    size="small"
                    color="secondary"
                    error={votesRemaining < 0}
                    sx={{ width: '30%' }}
                    onChange={(event) => {
                      handleVotesRemaining(
                        epochId,
                        choiceId,
                        parseInt(event.target.value, 10)
                      );
                      handleVotesGiven(
                        epochId,
                        choiceId,
                        parseInt(event.target.value, 10)
                      );
                    }}
                  />
                )}
              </TableCell>
              {!active && (
                <TableCell align="right">
                  {choiceId in values && values[choiceId]
                    ? values[choiceId].toFixed(3)
                    : 0}{' '}
                  {tokenSymbol}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default NumericVoting;
