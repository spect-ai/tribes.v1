import { Avatar, AvatarGroup, Tooltip, Box } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { Member } from '../../../types';
import MemberInfoDisplay from '../memberInfoDisplay';

type Props = {
  memberIds: string[];
  memberDetails: any;
  avatarGroupsx?: object;
  maxAvatars?: number;
  testid?: string;
};

export default function MemberAvatarGroup({
  memberIds,
  memberDetails,
  avatarGroupsx,
  maxAvatars,
  testid,
}: Props) {
  const { getAvatar } = useProfileInfo();
  const numDisplayedAvatars = maxAvatars ? maxAvatars - 1 : 1;
  return (
    <AvatarGroup
      sx={
        avatarGroupsx || {
          '& .MuiAvatar-root': {
            width: '2rem',
            height: '2rem',
            fontSize: 15,
          },
        }
      }
      data-testid={testid || 'avatarGroup'}
    >
      {numDisplayedAvatars < memberIds.length - 1 && (
        <>
          {memberIds.length - numDisplayedAvatars > 0 && (
            <Tooltip
              title={
                <Box>
                  {memberIds
                    .slice(numDisplayedAvatars, memberIds.length)
                    ?.map((memberId) => {
                      return (
                        <MemberInfoDisplay member={memberDetails[memberId]} />
                      );
                    })}
                </Box>
              }
              key="grp"
            >
              <Avatar>{`+${memberIds.length - numDisplayedAvatars}`}</Avatar>
            </Tooltip>
          )}
          {memberIds.slice(0, numDisplayedAvatars)?.map((memberId) => {
            return (
              <Tooltip title={memberDetails[memberId]?.username} key={memberId}>
                <Avatar
                  alt={memberDetails[memberId]?.username}
                  src={getAvatar(memberDetails[memberId])}
                />
              </Tooltip>
            );
          })}
        </>
      )}
      {numDisplayedAvatars >= memberIds.length - 1 && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {memberIds.slice(0, numDisplayedAvatars + 1)?.map((memberId) => {
            return (
              <Tooltip title={memberDetails[memberId]?.username} key={memberId}>
                <Avatar
                  alt={memberDetails[memberId]?.username}
                  src={getAvatar(memberDetails[memberId])}
                />
              </Tooltip>
            );
          })}
        </>
      )}
    </AvatarGroup>
  );
}
