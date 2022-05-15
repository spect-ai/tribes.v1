import styled from '@emotion/styled';
import { Box, styled as MUIStyled } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';

type Props = {};

const StyledAnchor = MUIStyled('a')(({ theme }) => ({
  color: 'rgb(90, 105, 114,0.6)',
  marginRight: '0.8rem',
  fontSize: '1.2rem',
  transition: '0.3s ease-in-out',
  '&:hover': {
    color: 'rgb(90, 105, 114,1)',
  },
}));

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

function TribeHeading(props: Props) {
  const { tab, handleTabChange, tribe, isMember, setIsMember, loading } =
    useTribe();
  const router = useRouter();
  const id = router.query.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user, isAuthenticated, authenticate } = useMoralis();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          ml: 4,
        }}
      >
        {tribe.github && (
          <StyledAnchor href={tribe.github} target="_blank">
            <i className="fab fa-github" />
          </StyledAnchor>
        )}
        {tribe.discord && (
          <StyledAnchor href={tribe.discord} target="_blank">
            <i className="fab fa-discord" />
          </StyledAnchor>
        )}
        {tribe.twitter && (
          <StyledAnchor href={tribe.twitter} target="_blank">
            <i className="fab fa-twitter" />
          </StyledAnchor>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          ml: 4,
        }}
      />
    </Container>
  );
}

export default TribeHeading;
