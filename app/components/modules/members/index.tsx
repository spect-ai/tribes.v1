import {
  Autocomplete,
  Checkbox,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTeam, updateBoardMembers } from "../../../adapters/moralis";
import { BoardData, Team } from "../../../types";
import { useBoard } from "../taskBoard";
import styled from "@emotion/styled";
import { PrimaryButton } from "../../elements/styledComponents";

type Props = {};

const Members = (props: Props) => {
  const { data, setData } = useBoard();
  const [tribe, setTribe] = useState<Team>({} as Team);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user } = useMoralis();
  const [isChecked, setIsChecked] = useState([] as boolean[]);
  const [roles, setRoles] = useState({} as { [key: string]: string });
  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked?.map((v, i) => (i === index ? !v : v)));
  };
  useEffect(() => {
    getTeam(Moralis, data.teamId).then((res: Team) => {
      setTribe(res);
      const membersArray = res.members.map((member: string) => {
        return data.members.indexOf(member) !== -1;
      });
      let roles = {};
      res.members.map((member: string) => {
        // @ts-ignore
        roles[member] = data.roles[member] || "member";
      });
      console.log(roles);
      setRoles(roles);
      setIsChecked(membersArray);
      console.log(data.roles);
      console.log(data.members);
    });
  }, []);

  const onSave = () => {
    setIsLoading(true);
    const members = tribe.members.filter((member: string, index: number) => {
      return isChecked[index];
    });
    updateBoardMembers(Moralis, data.objectId, members, roles)
      .then((res: BoardData) => {
        setIsLoading(false);
        setData(res);
      })
      .catch((err: any) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <Container>
      <Table aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={isChecked.every((elem) => elem === true)}
                disabled={data.roles[user?.id as string] !== "admin"}
                onChange={(e) => {
                  setIsChecked(
                    Array(tribe.members.length).fill(e.target.checked)
                  );
                }}
              />
            </TableCell>
            <TableCell align="right" sx={{ color: "#99ccff" }}>
              Username
            </TableCell>
            <TableCell align="right" sx={{ color: "#99ccff" }}>
              Role
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tribe.members?.map((member, index) => (
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
                  color="primary"
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                  checked={isChecked.at(index) || false}
                  disabled={data.roles[user?.id as string] !== "admin"}
                  onClick={() => {
                    toggleCheckboxValue(index);
                  }}
                />
              </TableCell>
              <TableCell align="right">
                {tribe.memberDetails[member].username}
              </TableCell>
              <TableCell align="right">
                <Select
                  value={roles[member] || "member"}
                  fullWidth
                  sx={{ width: "30%" }}
                  disabled={data.roles[user?.id as string] !== "admin"}
                  onChange={(e) => {
                    setRoles({ ...roles, [member]: e.target.value });
                  }}
                >
                  <MenuItem value={"member"}>Member</MenuItem>
                  <MenuItem value={"admin"}>Admin</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.roles[user?.id as string] === "admin" && (
        <PrimaryButton
          variant="outlined"
          sx={{ borderRadius: 1, width: "20%", mt: 2 }}
          fullWidth
          onClick={onSave}
          loading={isLoading}
        >
          Save
        </PrimaryButton>
      )}
    </Container>
  );
};

const Container = styled.div``;

export default Members;
