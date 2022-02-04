import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function createData(walletAddress:any, role:string, votes:number, reward:number) {
    let walletAddressSort = `${ walletAddress.slice(0,7)}...${walletAddress.slice(35)}`
    return { walletAddressSort, role, votes, reward };
  }
const walletAddress:string='0x350ba81398f44Bf06cd176004a275c451F0A1d91';
const rows = [
  createData( walletAddress, 'admin', 6, 24),
  createData(walletAddress, 'admin', 9, 37),
  createData(walletAddress, 'admin', 16, 24),
  createData(walletAddress, 'admin', 3, 67),
  createData(walletAddress, 'admin', 16, 49),
];

const ContributorsTableComponent = () => {
    return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">Role</TableCell>
            <TableCell align="right">Votes given</TableCell>
            <TableCell align="right">Reward</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.walletAddressSort}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.walletAddressSort}
              </TableCell>
              <TableCell align="right">{row.role}</TableCell>
              <TableCell align="right">{row.votes}</TableCell>
              <TableCell align="right">{row.reward}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    )
}

export default ContributorsTableComponent
