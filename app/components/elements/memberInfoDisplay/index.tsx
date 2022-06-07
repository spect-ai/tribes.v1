import {
  Box,
  Typography,
  styled,
  SxProps,
  Theme,
  Link,
  IconButton,
} from '@mui/material';
import React from 'react';
import { useRouter } from 'next/router';
import { Member, Profile } from '../../../types';
import MemberAvatar from '../memberAvatar';

type Props = {
  member?: Member | Profile;
  placeholder?: string;
  textsx?: SxProps<Theme> | undefined;
  textVariant?: string;
  avatarsx?: SxProps<Theme> | undefined;
  boxsx?: SxProps<Theme> | undefined;
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
          justifyContent: 'start',
          alignItems: 'center',
        }
      }
    >
      <MemberAvatar
        member={member}
        avatarsx={
          avatarsx || { width: '1.5rem', height: '1.5rem', fontSize: 15 }
        }
      />
      <Typography variant="body2" sx={textsx || { fontSize: 14, ml: 1 }}>
        {member?.username || placeholder}
      </Typography>
    </Box>
  );
}
