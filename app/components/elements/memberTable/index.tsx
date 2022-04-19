import styled from '@emotion/styled';
import { Avatar, Box, ButtonProps, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoardData, Member, Team } from '../../../types';
import MemberPopover from '../../modules/memberPopover';
import { PrimaryButton } from '../styledComponents';

type Props = {
  isChecked: boolean[];
  setIsChecked: (isChecked: boolean[]) => void;
  members: string[];
  memberDetails: { [key: string]: Member };
  roles: { [key: string]: number };
  setRoles: (roles: { [key: string]: number }) => void;
  entity: BoardData | Team;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const MembersSection = styled.div`
  padding: 2rem;
`;

const MemberButton = styled(PrimaryButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText('#000f29'),
  borderRadius: 24,
  marginRight: '0.6rem',
  marginTop: '0.3rem',
}));

function MemberTable({
  isChecked,
  setIsChecked,
  members,
  memberDetails,
  roles,
  setRoles,
  entity,
}: Props) {
  const [member, setMember] = useState<any>();
  const [anchorEl, setAnchorEl] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <Container>
      {isOpen && (
        <MemberPopover
          open={isOpen}
          handleClose={handleClose}
          anchorEl={anchorEl}
          member={member}
          roles={roles}
        />
      )}
      <MembersSection>
        <Typography color="text.secondary">Stewards</Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {members?.map((mem, index) => {
            if (roles[member] === 3) {
              return (
                <MemberButton
                  key={mem}
                  variant="outlined"
                  color="secondary"
                  onClick={(event) => {
                    setMember({
                      id: member,
                      role: roles[member],
                    });
                    setAnchorEl(event.currentTarget);
                    setIsOpen(true);
                  }}
                >
                  <Avatar
                    sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                    src={
                      memberDetails[mem].profilePicture?._url ||
                      `https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`
                    }
                  />
                  {memberDetails[member].username}
                </MemberButton>
              );
            }
            return <div />;
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Contributors</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {members?.map((mem, index) => {
            if (roles[member] === 2) {
              return (
                <MemberButton
                  key={mem}
                  variant="outlined"
                  color="secondary"
                  onClick={(event) => {
                    setMember({
                      id: member,
                      role: roles[member],
                    });
                    setAnchorEl(event.currentTarget);
                    setIsOpen(true);
                  }}
                >
                  <Avatar
                    sx={{ p: 0, mr: 4, width: 32, height: 32 }}
                    src={
                      memberDetails[mem].profilePicture?._url ||
                      `https://cdn.discordapp.com/avatars/${memberDetails[member].discordId}/${memberDetails[member].avatar}.png`
                    }
                  />
                  {memberDetails[member].username}
                </MemberButton>
              );
            }
            return <div />;
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Members</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {members?.map((mem, index) => {
            if (roles[member] === 1) {
              return (
                <MemberButton
                  key={mem}
                  variant="outlined"
                  color="secondary"
                  onClick={(event) => {
                    setMember({
                      id: member,
                      role: roles[member],
                    });
                    setAnchorEl(event.currentTarget);
                    setIsOpen(true);
                  }}
                >
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
            return <div />;
          })}
        </Box>
      </MembersSection>
    </Container>
  );
}

export default MemberTable;
