import styled from '@emotion/styled';
import { Palette, useTheme } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box } from '@mui/system';
import React from 'react';
import { SoulboundInfo } from '../../../types';

type Props = {};

const Soulbound = styled.div<{ palette: Palette }>`
  width: 80%;
  height: 8rem;
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

const SoulboundContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
`;

function FullWidthCards() {
  const { palette } = useTheme();

  // TESTING: Add task data structure here
  const soulbounds: SoulboundInfo[] = [
    {
      claimee: 'abcd',
      contentUri: 'contentUri',
      title: 'test',
      deadline: '2020-01-01',
      description: 'test',
      issuer: 'abcd',
      id: 1,
    },
    {
      claimee: 'efgh',
      contentUri: 'contentUri',
      title: 'test2',
      deadline: '2020-01-03',
      description: 'test',
      issuer: 'qwewr',
      id: 1,
    },
  ];
  return (
    <Box sx={{ mx: 4, mt: 2, width: '80%' }}>
      {soulbounds.map((soulbound: any) => (
        <Soulbound palette={palette}>
          <SoulboundContent>{/* Add content here */}</SoulboundContent>
        </Soulbound>
      ))}
    </Box>
  );
}

export default FullWidthCards;
