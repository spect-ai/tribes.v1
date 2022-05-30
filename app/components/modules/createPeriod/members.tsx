import InfoIcon from '@mui/icons-material/Info';
import {
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  TableContainer,
} from '@mui/material';
import React from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import { Chain, Registry, Token } from '../../../types';
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from '../../../utils/utils';

type Props = {
  chain: Chain;
  setChain: (chain: Chain) => void;
  token: Token;
  setToken: (token: Token) => void;
  value: number;
  setValue: (value: number) => void;
  allocations: number[];
  handleAllocation: (allocation: number, index: number) => void;
  isChecked: boolean[];
  setIsChecked: (isChecked: boolean[]) => void;
  toggleCheckboxValue: (index: number) => void;
  setIsNextDisabled: (isNextDisabled: boolean) => void;
};

function MemberBudgetFields({
  chain,
  setChain,
  token,
  setToken,
  value,
  setValue,
  allocations,
  handleAllocation,
  isChecked,
  setIsChecked,
  toggleCheckboxValue,
  setIsNextDisabled,
}: Props) {
  const { space } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Tooltip title="This budget amount can be split among members based on the percentage of votes each member receives.">
        <Typography
          variant="body2"
          sx={{ color: 'text.primary', ml: 2, mr: 6, mb: 2 }}
        >
          How much budget are you distributing during this period?
          <InfoIcon sx={{ width: '0.8rem' }} />
        </Typography>
      </Tooltip>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Autocomplete
          data-testid="aEpochBudgetChain"
          options={getFlattenedNetworks(registry as Registry)}
          disableClearable
          value={chain}
          sx={{ width: '33%', mx: 2 }}
          onChange={(event, newValue) => {
            setChain(newValue as Chain);
            const tokens = getFlattenedCurrencies(
              registry as Registry,
              newValue?.chainId as string
            );
            if (tokens.length > 0) setToken(tokens[0]);
            else setToken({} as Token);
          }}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              placeholder="Network"
              size="small"
              color="secondary"
            />
          )}
        />
        <Autocomplete
          data-testid="aEpochBudgetToken"
          options={getFlattenedCurrencies(registry as Registry, chain.chainId)}
          value={token}
          sx={{ width: '33%', mx: 2 }}
          onChange={(event, newValue) => {
            setToken(newValue as Token);
          }}
          disableClearable
          getOptionLabel={(option) => option.symbol}
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              placeholder="ETH"
              size="small"
              color="secondary"
            />
          )}
        />
        <TextField
          data-testid="iEpochBudgetValue"
          id="filled-hidden-label-normal"
          placeholder="Budget amount"
          type="number"
          size="small"
          color="secondary"
          value={value}
          onChange={(event) => {
            setValue(parseInt(event.target.value, 10));
          }}
          sx={{ width: '33%', mx: 2 }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.primary', ml: 2, mt: 4 }}>
        Please add members to the period
      </Typography>{' '}
      <TableContainer style={{ maxHeight: '24rem' }}>
        <Table aria-label="simple table" size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={{ color: '#99ccff', width: '40%' }}>
                Member
              </TableCell>
              <TableCell align="right" sx={{ color: '#99ccff' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: '#99ccff', width: '8rem' }}
                  >
                    Can Receive Votes
                  </Typography>
                  <Checkbox
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                    color="default"
                    checked={isChecked.every((elem) => elem === true)}
                    onChange={(e: any) => {
                      setIsChecked(
                        Array(space.members.length).fill(e.target.checked)
                      );
                    }}
                  />
                </Box>
              </TableCell>
              <Tooltip title="This allocation can be used by a member to vote on other members during the retro period. At the end of the period, the final vote distribution can be used to distribute a budget.">
                <TableCell align="right" sx={{ color: '#99ccff' }}>
                  Voting Allocation
                  <InfoIcon sx={{ width: '0.8rem' }} />
                </TableCell>
              </Tooltip>
            </TableRow>
          </TableHead>
          <TableBody>
            {space.members?.map((member, index) => (
              <TableRow
                key={member}
                sx={{
                  '&:last-child td, &:last-child th': {
                    border: 0,
                  },
                }}
              >
                <TableCell align="left">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        p: 0,
                        mr: 2,
                        width: 25,
                        height: 25,
                      }}
                      src={space.memberDetails[member]?.profilePicture?._url}
                      alt={space.memberDetails[member]?.username}
                    />
                    {space.memberDetails[member].username}
                  </Box>
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  padding="checkbox"
                  align="center"
                >
                  <Checkbox
                    color="secondary"
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                    checked={isChecked[index]}
                    onClick={() => {
                      toggleCheckboxValue(index);
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    id="filled-hidden-label-normal"
                    value={allocations[index]}
                    onChange={(event) => {
                      if (parseInt(event.target.value, 10) >= 0) {
                        handleAllocation(
                          index,
                          parseInt(event.target.value, 10)
                        );
                      }
                    }}
                    size="small"
                    type="number"
                    sx={{ width: '6rem' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MemberBudgetFields;
