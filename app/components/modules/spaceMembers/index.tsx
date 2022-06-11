import styled from '@emotion/styled';
import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import MemberTable from '../../elements/memberTable';
import SpaceRoleMapping from '../../elements/spaceRoleMapping';
import InviteMemberModal from '../inviteMemberModal';

type Props = {};

const Container = styled.div``;

function SpaceMembers(props: Props) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const [roles, setRoles] = useState({} as { [key: string]: number });

  useEffect(() => {
    setRoles(space.roles);
  }, [space]);

  return (
    <Container>
      <Toaster />
      <Box
        sx={{
          ml: { xs: 0, md: 8 },
          mr: { xs: 4, md: 0 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {space.roles[user?.id as string] === 3 && <SpaceRoleMapping />}
        {space.roles[user?.id as string] === 3 && <InviteMemberModal />}
      </Box>

      <MemberTable
        members={space.members}
        memberDetails={space.memberDetails}
        roles={roles}
      />
    </Container>
  );
}

export default SpaceMembers;
