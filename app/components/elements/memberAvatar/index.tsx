import PersonIcon from '@mui/icons-material/Person';
import { Avatar, SxProps, Theme } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Member, Profile } from '../../../types';

type Props = {
  member?: Member | Profile;
  avatarsx?: SxProps<Theme> | undefined;
};

export default function MemberAvatar({ member, avatarsx }: Props) {
  const { getAvatar } = useProfileInfo();
  return member ? (
    <Avatar
      sx={
        avatarsx || {
          p: 0,
          mr: 0,
          width: 20,
          height: 20,
        }
      }
      src={member ? getAvatar(member) : null}
      alt={member?.username}
    />
  ) : (
    <PersonIcon sx={{ color: 'text.primary' }} />
  );
}
