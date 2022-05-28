import styled from '@emotion/styled';
import { Palette, useTheme, Typography, Box, Avatar } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { useMoralis } from 'react-moralis';
import { Epoch } from '../../../types';
import { formatTimeCreated } from '../../../utils/utils';
import MemberGroupDisplay from '../../elements/memberGroupDisplay';
import { Card, CardContent } from '../fullWidthCards';
import { useProfile } from '../../../../pages/profile/[username]';

type Props = {
  epochs: Epoch[];
  spaceDetails: any;
  tribeDetails: any;
  memberDetails: any;
};

const ECard = styled.div<{ palette: Palette }>`
  width: 100%;
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

const ECardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding-top: 0.5rem;
  padding-left: 1.5rem;
`;

function FullWidthEpochs({
  epochs,
  spaceDetails,
  tribeDetails,
  memberDetails,
}: Props) {
  const { palette } = useTheme();
  const { profile } = useProfile();
  const { Moralis, user } = useMoralis();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        mt: 2,
        width: { xs: '100%', md: '80%' },
      }}
    >
      {epochs?.map((epoch: any) => (
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
                  width: { sm: '60%', xl: '80%' },
                  mb: '0.5rem',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Participated In
                </Typography>
                <Typography
                  variant="h6"
                  color="secondary"
                  sx={{ width: '100%', overflow: 'auto' }}
                >{`${epoch.name}`}</Typography>
                <Typography
                  variant="subtitle2"
                  color="secondary"
                  sx={{ mt: '0.5rem', whiteSpace: 'normal' }}
                >
                  {' '}
                  {`${spaceDetails[epoch.spaceId].name}`}
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
                    src={tribeDetails[spaceDetails[epoch.spaceId].teamId].logo}
                  >
                    {tribeDetails[spaceDetails[epoch.spaceId].teamId].name[0]}
                  </Avatar>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    sx={{ ml: 1 }}
                  >
                    {' '}
                    {`${tribeDetails[spaceDetails[epoch.spaceId].teamId].name}`}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'end',
                  width: { sm: '35%', xl: '15%' },
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
                    Other participants
                  </Typography>
                  <MemberGroupDisplay
                    members={epoch.members}
                    memberDetails={memberDetails}
                    multiMemberBoxsx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'start',
                      justifyContent: 'start',
                    }}
                    placeholder="No participants"
                    textsx={{ fontSize: 14, ml: 1, color: 'text.primary' }}
                  />
                  )
                </Box>
                {user && profile.username === user?.get('username') && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'end',
                      justifyContent: 'end',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', lg: '1.0rem' },
                        mt: { xs: 2, md: 0 },
                      }}
                    >
                      Received
                    </Typography>
                    <Typography variant="body2" color="secondary" sx={{}}>
                      {(epoch.share * 100).toFixed(0)}% votes
                    </Typography>
                  </Box>
                )}
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
                    sx={{
                      fontSize: { xs: '0.8rem', lg: '1.0rem' },
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    {`Last updated `}{' '}
                  </Typography>
                  <Typography variant="body2" color="secondary" sx={{}}>
                    {`${formatTimeCreated(epoch.updatedAt)} ago`}
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

export default FullWidthEpochs;
