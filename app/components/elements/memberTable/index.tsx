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
import { useProfileInfo } from "../../../hooks/useProfileInfo";
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
  return (
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
                    src={
                      memberDetails[member].profilePicture?._url ||
                      `https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`
                    }
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
                    src={
                      memberDetails[member].profilePicture?._url ||
                      `https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`
                    }
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
                    src={
                      memberDetails[member].profilePicture?._url ||
                      `https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`
                    }
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
