import { Box, styled as muiStyled, Tab, Typography, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useProfile } from '../../../../pages/profile/[username]';
import { SoulboundInfo, Epoch, Task } from '../../../types';
import SkeletonLoader from './skeletonLoader';
import MemberInfoDisplay from '../../elements/memberInfoDisplay';
import { PrimaryButton, StyledTabs } from '../../elements/styledComponents';
import { useCardContext } from '../../modules/cardModal';
import FullWidthCards from '../../modules/fullWidthCards';
import FullWidthEpochs from '../../modules/fullWidthEpochs';
import ProfileSettings from '../../modules/profileSettings';

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

export const ProfileTab = muiStyled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  minHeight: '2.8rem !important',
  height: '2.8rem !important',
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(16),
  margin: '0rem !important',
  padding: '0rem !important',
  color: 'rgba(255, 255, 255, 0.6)',
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

const StyledAnchor = muiStyled('a')(({ theme }) => ({
  color: '#5a6972',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  fontSize: '1rem',
}));

function ProfileTemplate(props: Props) {
  const { profile, tab, handleTabChange, loading } = useProfile();
  const [reversedEpochs, setReversedEpochs] = useState(
    profile.epochs?.reverse() as Epoch[]
  );
  const [reversedCards, setReversedCards] = useState(
    profile.cards?.reverse() as Task[]
  );
  console.log(profile);
  useEffect(() => {
    setReversedEpochs(profile.epochs?.reverse());
    setReversedCards(profile.cards?.reverse());
  }, [loading]);
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
            component="img"
            sx={{
              height: '18rem',
              width: '100%',
              backgroundSize: 'cover',
              objectFit: 'cover',
            }}
            alt="The house from the offer."
            src="http://ipfs.io/ipfs/QmemsVgFSdwjvEPAgEY3698HwrR7P6oTjCyu6ptDiB1zqb"
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'start',
              mx: 32,
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
                  width: '8rem',
                  height: '8rem',
                  fontSize: 25,
                  marginTop: '-4rem',
                }}
                textsx={{
                  color: 'text.primary',
                  fontSize: 24,
                  mt: 1,
                  ml: 2,
                }}
                boxsx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'start',
                }}
              />
              <ProfileSettings />
              <Box sx={{ flex: '1 1 auto' }} />
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'start',
                  justifyContent: 'end',
                }}
              >
                {profile.website && (
                  <StyledAnchor>
                    <Link
                      target="_blank"
                      href={profile.website}
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'right',
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
                      }}
                    >
                      <i className="fab fa-github" />
                    </Link>
                  </StyledAnchor>
                )}
                {profile.twitter && (
                  <StyledAnchor>
                    <Link
                      target="_blank"
                      href={profile.twitter}
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'right',
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
              mx: 32,
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
              <StyledTabs value={tab} onChange={handleTabChange} centered>
                {/* <ProfileTab label="Soulbounds" data-testid="tSoulboundsTab" /> */}
                <ProfileTab label="Cards" data-testid="tCardsTab" />
                <ProfileTab label="Epochs" data-testid="tEpochsTab" />
              </StyledTabs>
              {!loading && (
                <>
                  {profile.cards && profile.cards?.length > 0 ? (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                      {tab === 0 && (
                        <FullWidthCards
                          cards={reversedCards}
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
                          epochs={reversedEpochs}
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
