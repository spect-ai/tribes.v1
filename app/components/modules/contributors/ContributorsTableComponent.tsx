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

function createData(
  walletAddress: any,
  role: string,
  votes: number,
  reward: number
) {
  let walletAddressSort = `${walletAddress.slice(0, 7)}...${walletAddress.slice(
    35
  )}`;
  return { walletAddressSort, role, votes, reward };
}
const walletAddress: string = "0x350ba81398f44Bf06cd176004a275c451F0A1d91";
const rows = [
  createData(walletAddress, "admin", 6, 24),
  createData(walletAddress, "admin", 9, 37),
  createData(walletAddress, "admin", 16, 24),
  createData(walletAddress, "admin", 3, 67),
  createData(walletAddress, "admin", 16, 49),
  createData(walletAddress, "admin", 6, 24),
  createData(walletAddress, "admin", 9, 37),
  createData(walletAddress, "admin", 16, 24),
  createData(walletAddress, "admin", 3, 67),
  createData(walletAddress, "admin", 16, 49),
  createData(walletAddress, "admin", 6, 24),
  createData(walletAddress, "admin", 9, 37),
  createData(walletAddress, "admin", 16, 24),
  createData(walletAddress, "admin", 3, 67),
  createData(walletAddress, "admin", 16, 49),
  createData(walletAddress, "admin", 6, 24),
  createData(walletAddress, "admin", 9, 37),
  createData(walletAddress, "admin", 16, 24),
  createData(walletAddress, "admin", 3, 67),
  createData(walletAddress, "admin", 16, 49),
];

const ContributorsTableComponent = () => {
  const { isAuthenticated, Moralis } = useMoralis();
  const [epoch, setEpoch] = useState<Epoch>({} as Epoch);
  const [memberStats, setMemberStats] = useState([]);

  // useEffect(() => {
  //   getEpoch(Moralis, "MkKNkxfyi1EHnFAmtnws3rw6").then((res: Epoch) => {
  //     console.log(res);
  //     setEpoch(res);
  //     console.log(res.memberStats);
  //     setMemberStats(res.memberStats);
  //   }, []);
  // });
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right" style={{ color: "#99ccff" }}>
              Role
            </TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}>
              Votes given
            </TableCell>
            <TableCell align="center" style={{ color: "#99ccff" }}>
              Reward
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.walletAddressSort}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.walletAddressSort}
              </TableCell>
              <TableCell align="right">{row.role}</TableCell>
              <TableCell align="center">
                <TextField
                  id={row.walletAddressSort}
                  label="Votes Given"
                  type="number"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  style={{ width: "40%" }}
                  placeholder="Votes"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  defaultValue={row.votes}
                  onChange={(value) => console.log(value)}
                />
              </TableCell>
              <TableCell align="center">{row.reward}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContributorsTableComponent;
