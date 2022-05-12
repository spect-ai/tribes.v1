import { Box, Typography, styled } from '@mui/material';
import React from 'react';
import { Member } from '../../../types';
import MemberAvatar from '../memberAvatar';

type Props = {
  member?: Member;
  placeholder?: string;
  textsx?: object;
  textVariant?: string;
  avatarsx?: object;
  boxsx?: object;
};

export default function MemberInfoDisplay({
  member,
  placeholder,
  textsx,
  textVariant,
  avatarsx,
  boxsx,
}: Props) {
  return (
    <Box
      sx={
        boxsx || {
          display: 'flex',
          flexDirection: 'row',
          mx: 1,
        }
      }
    >
      <MemberAvatar member={member} avatarsx={avatarsx} />
      <Typography variant="body2" sx={textsx || { fontSize: 14, ml: 1 }}>
        {member?.username || placeholder}
      </Typography>
    </Box>
  );
}
