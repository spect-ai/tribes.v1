import { Avatar, Typography, styled } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Member } from '../../../types';

type Props = {
  avatarSrc?: any;
  avatarDefault?: any;
  info?: string;
};

export default function CardInfoDisplay({
  avatarSrc,
  avatarDefault,
  info,
}: Props) {
  return (
    <>
      <Avatar
        sx={{
          p: 0,
          mr: 0,
          width: 20,
          height: 20,
          backgroundColor: 'transparent',
        }}
        src={avatarSrc}
      >
        {avatarDefault}
      </Avatar>
      <Typography
        sx={{
          fontSize: 14,
          ml: 1,
        }}
      >
        {info}
      </Typography>
    </>
  );
}
