import PersonIcon from '@mui/icons-material/Person';
import { Avatar, ButtonProps, styled } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Member } from '../../../types';

type Props = {
  member?: Member;
};

export default function MemberAvatar({ member }: Props) {
  const { getAvatar } = useProfileInfo();
  return (
    <Avatar
      sx={{
        p: 0,
        mr: 0,
        width: 20,
        height: 20,
        backgroundColor: 'transparent',
      }}
      src={member ? getAvatar(member) : ''}
      alt={member?.username}
    >
      {' '}
      <PersonIcon sx={{ color: 'text.primary' }} />{' '}
    </Avatar>
  );
}
