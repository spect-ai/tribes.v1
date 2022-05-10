import { Box, Typography, styled } from '@mui/material';
import React from 'react';
import { Member } from '../../../types';
import MemberAvatar from '../memberAvatar';

type Props = {
  member?: Member;
  placeholder?: string;
};

export default function MemberInfoDisplay({ member, placeholder }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mx: 1,
      }}
    >
      <MemberAvatar member={member} />
      <Typography variant="body2" sx={{ fontSize: 14, ml: 1 }}>
        {member?.username || placeholder}
      </Typography>
    </Box>
  );
}
