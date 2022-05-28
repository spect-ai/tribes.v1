import { Box, styled as muiStyled, Tab, Typography, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useProfile } from '../../../../pages/profile/[username]';
import { Epoch, Task } from '../../../types';
import SkeletonLoader from './skeletonLoader';
import MemberInfoDisplay from '../../elements/memberInfoDisplay';
import {
  PrimaryButton,
  StyledTab,
  ScrollableTabs,
  StyledTabs,
} from '../../elements/styledComponents';
import { useCardContext } from '../../modules/cardModal';
import FullWidthCards from '../../modules/fullWidthCards';
import FullWidthEpochs from '../../modules/fullWidthEpochs';
import ProfileSettings from '../../modules/profileSettings';
import { sortByDate } from '../../../utils/utils';

type Props = {};
interface StyledTabProps {
  icon?: any;
  iconPosition?: 'start' | 'end';
  label: string;
  disabled?: boolean;
}

const OuterDiv = styled.div`
  width: 100%;
`;

const StyledAnchor = muiStyled('a')(({ theme }) => ({
  color: '#5a6972',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: '0.1rem',
    paddingRight: '0.1rem',
  },
  [theme.breakpoints.up('sm')]: {
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
  fontSize: '1rem',
}));

function ProfileTemplate(props: Props) {
  const { profile, tab, handleTabChange, loading } = useProfile();

  const [sortedCards, setSortedCards] = useState([] as Task[]);
  const [sortedEpochs, setSortedEpochs] = useState([] as Epoch[]);
  const [website, setWebsite] = useState('');

  console.log(profile);
  useEffect(() => {
    if (profile.epochs) {
      setSortedEpochs(sortByDate(profile.epochs as Epoch[]));
    }
    if (profile.cards) {
      setSortedCards(sortByDate(profile.cards as Task[]));
    }
  }, [loading]);

  useEffect(() => {
    if (profile.website) {
      setWebsite(profile.website);
    }
  }, [profile.website]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <OuterDiv>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <Box
          data-testid="profile-template-container"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'start',
            width: '100%',
            mb: 8,
          }}
        >
          <Box
            data-testid="profile-template-container"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'start',
              width: '100%',
              height: { xs: '12rem', lg: '18rem' },
            }}
          >
            <Box
              component="img"
              sx={{
                height: '100%',
                width: '100%',
                backgroundSize: 'cover',
                objectFit: 'cover',
              }}
              alt="The house from the offer."
              src="https://f6xaf3mz0jcx.usemoralis.com:2053/server/files/UX5s7GHMQGHbHTZ6zNPXE3AkXFsaKbLMMHGH1KVh/1c83418457e86d8ada76088f0e41e744_cover2.jpg"
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'start',
              mx: { xs: 12, sm: 24, lg: 32 },
              width: '80%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '80%',
              }}
            >
              <MemberInfoDisplay
                member={profile}
                avatarsx={{
                  width: { xs: '6rem', lg: '8rem' },
                  height: { xs: '6rem', lg: '8rem' },
                  fontSize: { xs: 15, lg: 25 },
                  marginTop: { xs: '-3rem', lg: '-4rem' },
                }}
                textsx={{
                  color: 'text.primary',
                  fontSize: { xs: 20, lg: 25 },
                  mt: 1,
                  ml: { xs: 1, lg: 2 },
                }}
                boxsx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'start',
                }}
              />
              <ProfileSettings />
              <Box sx={{ flex: { lg: '1 1 auto' } }} />
              <Box
                sx={{
                  mt: { xs: 1, md: 3 },
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'start',
                  justifyContent: 'start',
                }}
              >
                {website.length > 0 && (
                  <StyledAnchor>
                    <Link
                      target="_blank"
                      href={website}
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'right',
                        fontSize: { xs: 12, lg: 20 },
                      }}
                    >
                      <i className="fas fa-link" />
                    </Link>
                  </StyledAnchor>
                )}
                {profile.github && (
                  <StyledAnchor>
                    <Link
                      target="_blank"
                      href={profile.github}
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'right',
                        fontSize: { xs: 12, lg: 20 },
                      }}
                    >
                      <i className="fab fa-github" />
                    </Link>
                  </StyledAnchor>
                )}
                {profile.twitter && !loading && (
                  <StyledAnchor>
                    <Link
                      target="_blank"
                      href={profile.twitter}
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'right',
                        fontSize: { xs: 12, lg: 20 },
                      }}
                    >
                      <i className="fab fa-twitter" />
                    </Link>
                  </StyledAnchor>
                )}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'start',
              mx: { xs: 12, sm: 24, lg: 32 },
              mt: 4,
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'start',
                width: '100%',
              }}
            >
              <ScrollableTabs value={tab} onChange={handleTabChange} centered>
                <StyledTab label="Cards" data-testid="tCardsTab" />
                <StyledTab label="Epochs" data-testid="tEpochsTab" />
              </ScrollableTabs>
              {!loading && (
                <>
                  {profile.cards && profile.cards?.length > 0 ? (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                      {tab === 0 && (
                        <FullWidthCards
                          cards={sortedCards}
                          spaceDetails={profile.spaceDetails}
                          tribeDetails={profile.tribeDetails}
                          memberDetails={profile.memberDetails}
                        />
                      )}
                    </>
                  ) : (
                    <Typography
                      sx={{ mt: 4 }}
                      variant="subtitle1"
                      color="text.primary"
                    >
                      {' '}
                      No cards to display{' '}
                    </Typography>
                  )}
                  {profile.epochs && profile.epochs?.length > 0 ? (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                      {tab === 1 && (
                        <FullWidthEpochs
                          epochs={sortedEpochs}
                          spaceDetails={profile.spaceDetails}
                          tribeDetails={profile.tribeDetails}
                          memberDetails={profile.memberDetails}
                        />
                      )}
                    </>
                  ) : (
                    <Typography
                      sx={{ mt: 4 }}
                      variant="subtitle1"
                      color="text.primary"
                    >
                      {' '}
                      No epochs to display{' '}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
          {/* {tab === 0 && <Soulbounds soulbounds={soulbounds} />} */}
        </Box>
      )}
    </OuterDiv>
  );
}

export default ProfileTemplate;
