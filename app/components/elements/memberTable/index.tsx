import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  ButtonProps,
  Checkbox,
  MenuItem,
  Select,
  styled as MUIStyled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useMoralis } from "react-moralis";
import { BoardData, Member, Team } from "../../../types";
import { PrimaryButton } from "../styledComponents";

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
    // <Table aria-label="simple table" size="small">
    //   <TableHead>
    //     <TableRow>
    //       <TableCell padding="checkbox">
    //         <Checkbox
    //           // checked={isChecked.every((elem) => elem === true)}
    //           // disabled={entity.roles[user?.id as string] !== 3}
    //           checked
    //           disabled
    //           onChange={(e) => {
    //             setIsChecked(Array(members.length).fill(e.target.checked));
    //           }}
    //           color="default"
    //         />
    //       </TableCell>
    //       <TableCell align="right" sx={{ color: palette.text.secondary }}>
    //         Username
    //       </TableCell>
    //       <TableCell align="right" sx={{ color: palette.text.secondary }}>
    //         Role
    //       </TableCell>
    //     </TableRow>
    //   </TableHead>
    //   <TableBody>
    //     {members?.map((member, index) => (
    //       <TableRow
    //         key={index}
    //         sx={{
    //           "&:last-child td, &:last-child th": {
    //             border: 0,
    //           },
    //         }}
    //       >
    //         <TableCell component="th" scope="row" padding="checkbox">
    //           <Checkbox
    //             color="secondary"
    //             inputProps={{
    //               "aria-label": "select all desserts",
    //             }}
    //             // checked={isChecked.at(index) || false}
    //             // disabled={entity.roles[user?.id as string] !== 3}
    //             checked
    //             disabled
    //             onClick={() => {
    //               toggleCheckboxValue(index);
    //             }}
    //           />
    //         </TableCell>
    //         <TableCell
    //           align="right"
    //           sx={{ fontWeight: `${user?.id === member ? 600 : 200}` }}
    //         >
    //           {memberDetails[member].username}
    //         </TableCell>
    //         <TableCell align="right">
    //           <Select
    //             value={roles[member] || 0}
    //             fullWidth
    //             size="small"
    //             sx={{
    //               width: "30%",
    //               fontSize: 12,
    //               textAlign: "center",
    //             }}
    //             // disabled={entity.roles[user?.id as string] !== 3}
    //             disabled
    //             onChange={(e) => {
    //               setRoles({ ...roles, [member]: e.target.value as number });
    //             }}
    //             color="secondary"
    //           >
    //             <MenuItem value={1}>Member</MenuItem>
    //             <MenuItem value={2}>Contributor</MenuItem>
    //             <MenuItem value={3}>Steward</MenuItem>
    //           </Select>
    //         </TableCell>
    //       </TableRow>
    //     ))}
    //   </TableBody>
    // </Table>
    <Container>
      <MembersSection>
        <Typography color="text.secondary">Stewards</Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {members?.map((member, index) => {
            if (roles[member] === 3) {
              return (
                <MemberButton key={index} variant="outlined" color="secondary">
                  <Avatar
                    sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                    src={`https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`}
                  />
                  {memberDetails[member].username}
                </MemberButton>
              );
            }
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Contributors</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {members?.map((member, index) => {
            if (roles[member] === 2) {
              return (
                <MemberButton key={index} variant="outlined" color="secondary">
                  <Avatar
                    sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                    src={`https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`}
                  />
                  {memberDetails[member].username}
                </MemberButton>
              );
            }
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Members</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {members?.map((member, index) => {
            if (roles[member] === 1) {
              return (
                <MemberButton key={index} variant="outlined" color="secondary">
                  <Avatar
                    sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                    src={`https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`}
                  />
                  {memberDetails[member].username}
                </MemberButton>
              );
            }
          })}
        </Box>
      </MembersSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const MembersSection = styled.div`
  padding: 2rem;
`;

const MemberButton = styled(PrimaryButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#000f29"),
  borderRadius: 24,
  marginRight: "0.6rem",
  marginTop: "0.3rem",
}));
export default MemberTable;
