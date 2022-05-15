import { Avatar, ButtonProps, styled } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { PrimaryButton } from '../styledComponents';

type Props = {
  member: string;
  memberDetails: any;
  handleOnClick: (event: any, mem: string) => void;
};

const MemberButton = styled(PrimaryButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText('#000f29'),
  borderRadius: 24,
  marginRight: '0.6rem',
  marginTop: '0.3rem',
}));

export default function MemberDisplay({
  member,
  memberDetails,
  handleOnClick,
}: Props) {
  const { getAvatar } = useProfileInfo();
  return (
    <MemberButton
      variant="outlined"
      color="secondary"
      onClick={(event) => {
        handleOnClick(event, member);
      }}
    >
      <Avatar
        sx={{ p: 0, mr: 4, width: 32, height: 32 }}
        src={getAvatar(memberDetails[member])}
      />
      {memberDetails[member].username}
    </MemberButton>
  );
}
