import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Member } from '../../../types';
import MemberPopover from '../../modules/memberPopover';
import MemberDisplay from '../memberDisplay';

type Props = {
  members: string[];
  memberDetails: { [key: string]: Member };
  roles: { [key: string]: number };
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const MembersSection = styled.div`
  padding: 2rem;
`;

function MemberTable({ members, memberDetails, roles }: Props) {
  const [member, setMember] = useState<any>();
  const [anchorEl, setAnchorEl] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  const handleOnClick = (event: any, mem: string) => {
    setMember({
      id: mem,
      role: roles[mem],
    });
    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

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
          {members?.map((mem) => {
            if (roles[mem] === 3) {
              return (
                <MemberDisplay
                  key={mem}
                  member={mem}
                  memberDetails={memberDetails}
                  handleOnClick={handleOnClick}
                />
              );
            }
            return <div />;
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Contributors</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {members?.map((mem) => {
            if (roles[mem] === 2) {
              return (
                <MemberDisplay
                  key={mem}
                  member={mem}
                  memberDetails={memberDetails}
                  handleOnClick={handleOnClick}
                />
              );
            }
            return <div />;
          })}
        </Box>
      </MembersSection>
      <MembersSection>
        <Typography color="text.secondary">Members</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {members?.map((mem) => {
            if (roles[mem] === 1) {
              return (
                <MemberDisplay
                  key={mem}
                  member={mem}
                  memberDetails={memberDetails}
                  handleOnClick={handleOnClick}
                />
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
