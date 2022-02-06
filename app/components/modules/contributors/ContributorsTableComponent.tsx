import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { Epoch, Team } from "../../../types/index";
import { getRemainingVotes } from "../../../utils/utils";
import { useMoralis } from "react-moralis";
interface Props {
  epoch: Epoch;
  setRemainingVotes: any;
  remainingVotes: number;
  setVoteAllocation: any;
  voteAllocation: {
    [key: string]: number;
  };
}

const ContributorsTableComponent = ({
  epoch,
  setRemainingVotes,
  remainingVotes,
  setVoteAllocation,
  voteAllocation,
}: Props) => {
  useEffect(() => {
    console.log(epoch);
    console.log(voteAllocation["0x6304ce63f2ebf8c0cc76b60d34cc52a84abb6057"]);
    console.log(remainingVotes);
  }, []);

  const { user } = useMoralis();

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right" style={{ color: "#99ccff" }}></TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}></TableCell>
            {epoch.active && (
              <TableCell align="center" style={{ color: "#99ccff" }}>
                Votes given
              </TableCell>
            )}
            {!epoch.active && (
              <TableCell align="center" style={{ color: "#99ccff" }}>
                Reward Allocated
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {epoch.memberStats?.map((row: any) => (
            <TableRow
              key={row.ethAddress}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.ethAddress}
              </TableCell>
              <TableCell align="right">{}</TableCell>
              <TableCell align="center">{}</TableCell>
              {epoch.active && (
                <TableCell align="center">
                  {epoch.active && (
                    <TextField
                      id={row.ethAddress}
                      label="Votes Given"
                      type="number"
                      inputProps={{ min: 0, step: 1 }}
                      style={{ width: "40%" }}
                      placeholder="Votes"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={row.ethAddress === user?.get("ethAddress")}
                      // fix
                      defaultValue={voteAllocation[row.ethAddress]}
                      error={remainingVotes < 0}
                      onChange={(event) => {
                        console.log(voteAllocation);
                        console.log(row.ethAddress);
                        console.log(event.target.value);

                        const userRemainingVotes = getRemainingVotes(
                          remainingVotes,
                          parseInt(event.target.value),
                          voteAllocation?.hasOwnProperty(row.ethAddress)
                            ? voteAllocation[row.ethAddress]
                            : 0
                        );
                        console.log(userRemainingVotes);
                        setRemainingVotes(userRemainingVotes);
                        voteAllocation[row.ethAddress] = parseInt(
                          event.target.value
                        );
                        setVoteAllocation(voteAllocation);
                        console.log(voteAllocation);
                      }}
                    />
                  )}
                </TableCell>
              )}
              {!epoch.active && (
                <TableCell align="center" style={{ color: "#99ccff" }}>
                  {row.reward.toFixed(2)} WMatic
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContributorsTableComponent;
