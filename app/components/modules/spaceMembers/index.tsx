import { Box, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { getTeam, updateBoardMembers } from '../../../adapters/moralis';
import { BoardData, Team } from '../../../types';
import styled from '@emotion/styled';
import { PrimaryButton } from '../../elements/styledComponents';
import { Toaster } from 'react-hot-toast';
import { notify } from '../settingsTab';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import MemberTable from '../../elements/memberTable';
import SpaceRoleMapping from '../../elements/spaceRoleMapping';
import InviteMemberModal from '../inviteMemberModal';

type Props = {};

const SpaceMembers = (props: Props) => {
  const { space, setSpace } = useSpace();
  const [tribe, setTribe] = useState<Team>({} as Team);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user } = useMoralis();
  const [isChecked, setIsChecked] = useState([] as boolean[]);
  const [roles, setRoles] = useState({} as { [key: string]: number });

  useEffect(() => {
    setRoles(space.roles);
  }, [space]);

  return (
    <Container>
      <Toaster />
      <Box sx={{ ml: 8, display: 'flex' }}>
        {space.roles[user?.id as string] === 3 && <SpaceRoleMapping />}
        {space.roles[user?.id as string] === 3 && <InviteMemberModal />}
      </Box>

      <MemberTable
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        members={space.members}
        memberDetails={space.memberDetails}
        roles={roles}
        setRoles={setRoles}
        entity={space}
      />
    </Container>
  );
};

const Container = styled.div``;

export default SpaceMembers;
