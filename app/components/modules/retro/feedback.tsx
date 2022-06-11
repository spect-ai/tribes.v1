import { Avatar, Box, List, ListItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import usePeriod from '../../../hooks/usePeriod';
import { useSingleRetro } from './retroModal';

type Props = {};

// eslint-disable-next-line no-empty-pattern
function Feedback({}: Props) {
  const { space } = useSpace();
  const { feedbackReceived, period } = useSingleRetro();
  return (
    <List sx={{ ml: '1rem' }}>
      {period.members?.map((memberId: string, index: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <ListItem key={index}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              width: '100%',
              mt: 6,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'start',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'start',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    p: 0,
                    mr: 2,
                    width: 30,
                    height: 30,
                  }}
                  src={space.memberDetails[memberId]?.profilePicture?._url}
                  alt={space.memberDetails[memberId]?.username}
                />
                <Typography color="text.primary">
                  {space.memberDetails[memberId]?.username}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'end',
                alignItems: 'start',
                mt: 2,
              }}
            >
              {feedbackReceived && memberId in feedbackReceived ? (
                <Typography color="text.primary">
                  {feedbackReceived[memberId]}
                </Typography>
              ) : (
                <Typography color="text.primary">
                  No feedback received
                </Typography>
              )}
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

export default Feedback;
