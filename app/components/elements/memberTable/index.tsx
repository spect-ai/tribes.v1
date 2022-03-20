import {
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import React from "react";
import { useMoralis } from "react-moralis";
import { BoardData, Member, Team } from "../../../types";

type Props = {
  isChecked: boolean[];
  setIsChecked: (isChecked: boolean[]) => void;
  members: string[];
  memberDetails: { [key: string]: Member };
  roles: { [key: string]: number };
  setRoles: (roles: { [key: string]: number }) => void;
  entity: BoardData | Team;
};

const MemberTable = ({
  isChecked,
  setIsChecked,
  members,
  memberDetails,
  roles,
  setRoles,
  entity,
}: Props) => {
  const { palette } = useTheme();
  const { user } = useMoralis();
  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked?.map((v, i) => (i === index ? !v : v)));
  };
  return (
    <Table aria-label="simple table" size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={isChecked.every((elem) => elem === true)}
              disabled={entity.roles[user?.id as string] !== 3}
              onChange={(e) => {
                setIsChecked(Array(members.length).fill(e.target.checked));
              }}
              color="default"
            />
          </TableCell>
          <TableCell align="right" sx={{ color: palette.text.secondary }}>
            Username
          </TableCell>
          <TableCell align="right" sx={{ color: palette.text.secondary }}>
            Role
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {members?.map((member, index) => (
          <TableRow
            key={index}
            sx={{
              "&:last-child td, &:last-child th": {
                border: 0,
              },
            }}
          >
            <TableCell component="th" scope="row" padding="checkbox">
              <Checkbox
                color="secondary"
                inputProps={{
                  "aria-label": "select all desserts",
                }}
                checked={isChecked.at(index) || false}
                disabled={entity.roles[user?.id as string] !== 3}
                onClick={() => {
                  toggleCheckboxValue(index);
                }}
              />
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: `${user?.id === member ? 600 : 200}` }}
            >
              {memberDetails[member].username}
            </TableCell>
            <TableCell align="right">
              <Select
                value={roles[member] || 0}
                fullWidth
                size="small"
                sx={{
                  width: "30%",
                  fontSize: 12,
                  textAlign: "center",
                }}
                disabled={entity.roles[user?.id as string] !== 3}
                onChange={(e) => {
                  setRoles({ ...roles, [member]: e.target.value as number });
                }}
              >
                <MenuItem value={1}>Member</MenuItem>
                <MenuItem value={2}>Contributor</MenuItem>
                <MenuItem value={3}>Steward</MenuItem>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MemberTable;
