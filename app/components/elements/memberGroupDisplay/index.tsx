import PersonIcon from '@mui/icons-material/Person';
import { Box, ButtonProps, styled, Tooltip } from '@mui/material';
import React from 'react';
import { Member } from '../../../types';
import MemberInfoDisplay from '../memberInfoDisplay';
import MemberAvatar from '../memberAvatar';

type Props = {
  members: string[];
  memberDetails: any;
  placeholder: string;
};

export default function MemberGroupDisplay({
  members,
  memberDetails,
  placeholder,
}: Props) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {
        // eslint-disable-next-line no-nested-ternary
        members.length > 0 ? (
          members.length === 1 ? (
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <MemberInfoDisplay member={memberDetails[members[0]]} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              {members.map((id: string) => {
                return (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    <Tooltip title={memberDetails[id].username}>
                      <MemberAvatar member={memberDetails[id]} />
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <MemberInfoDisplay placeholder={placeholder} />
            </Box>
          </Box>
        )
      }
    </>
  );
}
