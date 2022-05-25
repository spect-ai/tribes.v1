import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  ButtonProps,
  styled,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { Member } from '../../../types';
import MemberInfoDisplay from '../memberInfoDisplay';
import MemberAvatar from '../memberAvatar';
import MemberAvatarGroup from '../memberAvatarGroup';

type Props = {
  members: string[];
  memberDetails: any;
  placeholder: string;
  textsx?: object;
  textVariant?: string;
  avatarsx?: object;
  boxsx?: SxProps<Theme> | undefined;
  multiMemberBoxsx?: object;
};

export default function MemberGroupDisplay({
  members,
  memberDetails,
  placeholder,
  textsx,
  textVariant,
  avatarsx,
  boxsx,
  multiMemberBoxsx,
}: Props) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {
        // eslint-disable-next-line no-nested-ternary
        members.length === 0 || members.length === 1 ? (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <MemberInfoDisplay
                member={members.length === 1 ? memberDetails[members[0]] : null}
                placeholder={placeholder}
                textsx={textsx}
                textVariant={textVariant}
                avatarsx={avatarsx}
                boxsx={boxsx}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={
              multiMemberBoxsx || {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }
            }
          >
            <MemberAvatarGroup
              memberIds={members}
              memberDetails={memberDetails}
              maxAvatars={4}
              avatarGroupsx={{
                '& .MuiAvatar-root': {
                  width: '1.5rem',
                  height: '1.5rem',
                  fontSize: 15,
                },
              }}
            />
          </Box>
        )
      }
    </>
  );
}
