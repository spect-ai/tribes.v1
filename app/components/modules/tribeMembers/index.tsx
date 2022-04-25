import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTribe } from '../../../../pages/tribe/[id]';
import MemberTable from '../../elements/memberTable';

type Props = {};
const Container = styled.div``;

function TribeMembers(props: Props) {
  const { tribe } = useTribe();
  const [roles, setRoles] = useState({} as { [key: string]: number });
  useEffect(() => {
    setRoles(tribe.roles);
  }, [tribe]);
  return (
    <Container>
      <Toaster />
      <MemberTable
        members={tribe.members}
        memberDetails={tribe.memberDetails}
        roles={roles}
      />
    </Container>
  );
}

export default TribeMembers;
