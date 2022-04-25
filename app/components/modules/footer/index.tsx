import { Box, Button, styled } from '@mui/material';
import React from 'react';

type Props = {};

const FooterDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  paddingBottom: '0.5rem',
}));

const FooterItem = styled(Button)(({ theme }) => ({
  fontSize: '1rem',
  marginLeft: '4rem',
  color: '#5a6972',
  textTransform: 'none',
}));

const StyledAnchor = styled('a')(({ theme }) => ({
  color: '#5a6972',
  paddingRight: '4rem',
}));

function Footer(props: Props) {
  return (
    <FooterDiv>
      <FooterItem>Community</FooterItem>
      <FooterItem>Ecosystem</FooterItem>
      <FooterItem>Docs</FooterItem>
      <Box sx={{ flex: '1 1 auto' }} />
      <StyledAnchor href="/">
        <i className="fab fa-github" />
      </StyledAnchor>
      <StyledAnchor>
        <i className="fab fa-discord" />
      </StyledAnchor>
      <StyledAnchor>
        <i className="fab fa-twitter" />
      </StyledAnchor>
    </FooterDiv>
  );
}

export default Footer;
