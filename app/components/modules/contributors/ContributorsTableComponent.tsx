import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { muiTheme } from "../../../constants/muiTheme";
import { getTeam } from "../../../adapters/moralis";
import { Epoch, Team } from "../../../types/index";
import { useMoralis } from "react-moralis";
import { getEpoch } from "../../../adapters/moralis";
interface Props {
  epoch: Epoch;
}

function getRemainingVotes(prevRemainingVotes: number, votesGiven: number, prevVotesGiven: number) {
  return prevRemainingVotes + Math.pow(prevVotesGiven, 2) - Math.pow(votesGiven, 2);
}

const ContributorsTableComponent = (props: Props) => {
  const { isAuthenticated, Moralis } = useMoralis();
  const [epoch, setEpoch] = useState<Epoch>({} as Epoch);
  const [votes, setVotes] = useState({});

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right" style={{ color: "#99ccff" }}></TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}></TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}>
              Votes given
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.epoch.memberStats?.map((row) => (
            <TableRow key={row.ethAddress} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {row.ethAddress}
              </TableCell>
              <TableCell align="right">{}</TableCell>
              <TableCell align="center">{}</TableCell>
              <TableCell align="center">
                <TextField
                  id={row.ethAddress}
                  label="Votes Given"
                  type="number"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  style={{ width: "40%" }}
                  placeholder="Votes"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  defaultValue={row.votesGiven}
                  onChange={(event) => {
                    console.log(event.target.value);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContributorsTableComponent;
