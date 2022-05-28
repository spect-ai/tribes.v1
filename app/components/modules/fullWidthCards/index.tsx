import styled from '@emotion/styled';
import { Palette, useTheme, Typography, Box, Avatar } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { Task } from '../../../types';
import { formatTimeCreated } from '../../../utils/utils';
import MemberGroupDisplay from '../../elements/memberGroupDisplay';

type Props = {
  cards: Task[];
  spaceDetails: any;
  tribeDetails: any;
  memberDetails: any;
};

export const Card = styled.div<{ palette: Palette }>`
  width: 70%;
  border: 1px solid ${(props) => props.palette.divider};
  border-radius: 4px;
  margin-bottom: 1rem;
  &:hover {
    cursor: pointer;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid ${(props) => props.palette.text.primary};
  }
  transition: all 0.5s ease;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding-top: 0.5rem;
  padding-left: 1.5rem;
`;

function FullWidthCards({
  cards,
  spaceDetails,
  tribeDetails,
  memberDetails,
}: Props) {
  const { palette } = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        mt: 2,
        width: { xs: '45%', sm: '75%', md: '80%' },
      }}
    >
      {cards?.map((card: any) => (
        <Card palette={palette}>
          <CardContent>
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
                  flexDirection: 'column',
                  alignItems: 'start',
                  width: { xs: '65%', sm: '75%', xl: '85%' },
                  mb: '0.5rem',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', lg: '1.0rem' } }}
                >
                  {card.action}
                </Typography>
                <Typography
                  variant="h6"
                  color="secondary"
                  sx={{ width: '100%', overflow: 'auto' }}
                >{`${card.title}`}</Typography>
                <Typography
                  variant="subtitle2"
                  color="secondary"
                  sx={{
                    mt: '0.5rem',
                    whiteSpace: 'normal',
                    fontSize: { xs: '0.9rem', lg: '1.0rem' },
                  }}
                >
                  {' '}
                  {`${spaceDetails[card.spaceId].name}`}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '50%',
                    mt: '0.2rem',
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{ p: 0, m: 0, width: 18, height: 18 }}
                    src={tribeDetails[spaceDetails[card.spaceId].teamId].logo}
                  >
                    {tribeDetails[spaceDetails[card.spaceId].teamId].name[0]}
                  </Avatar>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    sx={{ ml: 1 }}
                  >
                    {' '}
                    {`${tribeDetails[spaceDetails[card.spaceId].teamId].name}`}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'end',
                  width: { sm: '20%', xl: '10%' },
                  mr: '1.5rem',
                  ml: '1.5rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'end',
                    height: '3.5rem',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontSize: { xs: '0.8rem', lg: '1.0rem' } }}
                  >
                    {card.action === 'Worked on'
                      ? 'Reviewed by'
                      : 'Assigned to'}{' '}
                  </Typography>
                  <MemberGroupDisplay
                    members={
                      card.action === 'Worked on'
                        ? card.assignee
                        : card.reviewer
                    }
                    memberDetails={memberDetails}
                    placeholder={`No ${
                      card.action === 'Worked on' ? 'assignee' : 'reviewer'
                    }`}
                    multiMemberBoxsx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'start',
                      justifyContent: 'start',
                    }}
                    textsx={{ fontSize: 14, ml: 1, color: 'text.primary' }}
                  />
                  )
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'end',
                    justifyContent: 'end',
                    mb: '1.5rem',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontSize: { xs: '0.8rem', lg: '1.0rem' } }}
                  >
                    {`Last updated `}{' '}
                  </Typography>
                  <Typography variant="body2" color="secondary" sx={{}}>
                    {`${formatTimeCreated(card.updatedAt)} ago`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default FullWidthCards;
