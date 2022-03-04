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
  tribe: Team;
}

const ContributorsTableComponent = ({ tribe }: Props) => {
  useEffect(() => {}, []);

  const { user } = useMoralis();
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}>
              Role
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tribe.members?.map((row: any) => (
            <TableRow
              key={row.userId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.userId}
              </TableCell>
              <TableCell align="center">{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContributorsTableComponent;
