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
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTeam, updateBoardMembers } from "../../../adapters/moralis";
import { BoardData, Team } from "../../../types";
import styled from "@emotion/styled";
import { PrimaryButton } from "../../elements/styledComponents";
import { Toaster } from "react-hot-toast";
import { notify, notifyError } from "../settingsTab";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {};

const Members = (props: Props) => {
  const { space, setSpace } = useSpace();
  const [tribe, setTribe] = useState<Team>({} as Team);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user } = useMoralis();
  const [isChecked, setIsChecked] = useState([] as boolean[]);
  const [roles, setRoles] = useState({} as { [key: string]: string });
  const { palette } = useTheme();

  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked?.map((v, i) => (i === index ? !v : v)));
  };
  useEffect(() => {
    getTeam(Moralis, space.teamId)
      .then((res: Team) => {
        setTribe(res);
        const membersArray = res.members.map((member: string) => {
          return space.members.indexOf(member) !== -1;
        });
        let roles = {};
        res.members.map((member: string) => {
          // @ts-ignore
          roles[member] = space.roles[member] || "member";
        });
        setRoles(roles);
        setIsChecked(membersArray);
      })
      .catch((err: any) => {
        notifyError(`Sorry! There was an error while loading members.`);
      });
  }, []);

  const onSave = () => {
    if (!Object.values(roles).includes("admin")) {
      notify("You must have at least one admin", "error");
      return;
    }
    setIsLoading(true);
    const members = tribe.members.filter((member: string, index: number) => {
      return isChecked[index];
    });
    updateBoardMembers(Moralis, space.objectId, members, roles)
      .then((res: BoardData) => {
        setIsLoading(false);
        setSpace(res);
        notify("Members updated successfully");
      })
      .catch((err: any) => {
        console.log(err);
        notifyError("Sorry! There was an error while updating members.");
        setIsLoading(false);
      });
  };

  return (
    <Container>
      <Toaster />
      <Table aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={isChecked.every((elem) => elem === true)}
                disabled={space.roles[user?.id as string] !== "admin"}
                onChange={(e) => {
                  setIsChecked(
                    Array(tribe.members.length).fill(e.target.checked)
                  );
                }}
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
                  disabled={space.roles[user?.id as string] !== "admin"}
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
                  size="small"
                  sx={{
                    width: "30%",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                  disabled={space.roles[user?.id as string] !== "admin"}
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
      {space.roles[user?.id as string] === "admin" && (
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
