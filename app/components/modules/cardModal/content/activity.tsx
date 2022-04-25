import { Box, ListItemText } from '@mui/material';
import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import useActivityMap from '../../../../hooks/useActivityMap';
import { Task } from '../../../../types';
import { monthMap } from '../../../../constants';
import { useCardContext } from '..';

function Activity() {
  const { task } = useCardContext();
  const { activityIcons, resolveActivityComponent } = useActivityMap(task);

  return (
    <Timeline position="right" sx={{ width: '100%' }}>
      {task.activity.map((activity: any, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TimelineItem key={index}>
          <TimelineSeparator>
            {activityIcons[activity.action]}
            {index !== task.activity.length - 1 && (
              <TimelineConnector sx={{ my: 2 }} />
            )}
          </TimelineSeparator>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '75%',
                justifyContent: 'center',
                alignItems: 'start',
              }}
            >
              {
                /* <ListItemText primary={generateActivityLine(activity)} /> */
                resolveActivityComponent(activity)
              }
            </Box>
            <Box
              sx={{
                width: '20%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'start',
              }}
            >
              <ListItemText
                sx={{
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                }}
                primaryTypographyProps={{ fontSize: '13px' }}
              >
                {`${
                  monthMap[
                    activity.timestamp?.getMonth() as keyof typeof monthMap
                  ]
                }  ${activity?.timestamp?.getDate()}, ${activity?.timestamp?.toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}`}{' '}
              </ListItemText>
            </Box>
          </Box>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export default Activity;
