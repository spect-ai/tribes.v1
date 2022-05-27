import { Avatar, AvatarGroup, Tooltip, Box } from '@mui/material';
import React from 'react';
import useProfileInfo from '../../../hooks/useProfileInfo';
import MemberInfoDisplay from '../memberInfoDisplay';
import { StyledAvatar } from '../styledComponents';

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
    <AvatarGroup sx={avatarGroupsx} data-testid={testid || 'avatarGroup'}>
      {numDisplayedAvatars < memberIds.length - 1 && (
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          {memberIds.length - numDisplayedAvatars > 0 && (
            <Tooltip
              title={
                <Box>
                  {memberIds
                    .slice(numDisplayedAvatars, memberIds.length)
                    ?.map((memberId) => {
                      return (
                        <MemberInfoDisplay
                          member={memberDetails[memberId]}
                          key={memberId}
                        />
                      );
                    })}
                </Box>
              }
              key="grp"
            >
              <StyledAvatar>{`+${
                memberIds.length - numDisplayedAvatars
              }`}</StyledAvatar>
            </Tooltip>
          )}
          {memberIds.slice(0, numDisplayedAvatars)?.map((memberId) => {
            return (
              <Tooltip title={memberDetails[memberId]?.username} key={memberId}>
                <StyledAvatar
                  alt={memberDetails[memberId]?.username}
                  src={getAvatar(memberDetails[memberId])}
                />
              </Tooltip>
            );
          })}
        </div>
      )}
      {numDisplayedAvatars >= memberIds.length - 1 && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <div
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
        >
          {memberIds.slice(0, numDisplayedAvatars + 1)?.map((memberId) => {
            return (
              <Tooltip title={memberDetails[memberId]?.username} key={memberId}>
                <StyledAvatar
                  alt={memberDetails[memberId]?.username}
                  src={getAvatar(memberDetails[memberId])}
                />
              </Tooltip>
            );
          })}
        </div>
      )}
    </AvatarGroup>
  );
}
