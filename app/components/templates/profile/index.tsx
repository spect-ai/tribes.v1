import { Box, styled, Tab } from '@mui/material';
import React from 'react';
import { useProfile } from '../../../../pages/profile/[username]';
import MemberAvatar from '../../elements/memberAvatar';
import MemberInfoDisplay from '../../elements/memberInfoDisplay';
import { StyledTabs, StyledTab } from '../../elements/styledComponents';
import FullWidthCards from '../../modules/fullWidthCards';
import Soulbounds from '../../modules/soulbounds';

type Props = {};
interface StyledTabProps {
  icon?: any;
  iconPosition?: 'start' | 'end';
  label: string;
  disabled?: boolean;
}

export const ProfileTab = styled((props: StyledTabProps) => (
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

const StyledAnchor = styled('a')(({ theme }) => ({
  color: '#5a6972',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  fontSize: '1rem',
}));

function ProfileTemplate(props: Props) {
  const { profile, tab, handleTabChange } = useProfile();

  return (
    <Box
      data-testid="profile-template-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
        }}
        alt="The house from the offer."
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=350&dpr=2"
      />
      <Box
        sx={{
          marginX: 32,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          alignItems: 'start',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MemberInfoDisplay
            member={profile}
            avatarsx={{
              width: '8rem',
              height: '8rem',
              fontSize: 15,
              marginTop: '-4rem',
            }}
            textsx={{
              color: 'text.primary',
              fontSize: 24,
              mt: 1,
            }}
            boxsx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StyledAnchor>
              <i className="fab fa-github" />
            </StyledAnchor>
            <StyledAnchor>
              <i className="fab fa-discord" />
            </StyledAnchor>
            <StyledAnchor>
              <i className="fab fa-twitter" />
            </StyledAnchor>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          width: '80%',
        }}
      >
        <StyledTabs value={tab} onChange={handleTabChange} centered>
          <ProfileTab label="Soulbounds" data-testid="tSoulboundsTab" />
          <ProfileTab label="Cards" data-testid="tCardsTab" />
          <ProfileTab label="Gifts" data-testid="tGiftsTab" />
        </StyledTabs>
      </Box>
      {tab === 1 && <FullWidthCards cards={profile.cards} />}
    </Box>
  );
}

export default ProfileTemplate;
