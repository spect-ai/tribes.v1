/* eslint-disable */
import styled from '@emotion/styled';
import { Palette, useTheme, Grid } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box } from '@mui/system';
import React from 'react';
import { SoulboundInfo } from '../../../types';

type Props = {};

const Soulbound = styled.div<{ palette: Palette }>`
  height: 400px;
  width: 300px;
  background-image: url('/SpectNFTCard.svg');
  background-size: cover;
  border: 1px solid ${(props) => props.palette.divider};
  border-radius: 4px;
  margin: 1rem;
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
      title: 'Create an awesome landing page',
      deadline: '2020-01-03',
      description: 'test',
      issuer: 'qwewr',
      id: 2,
    },
  ];
  return (
    <Box sx={{ mx: 4, mt: 2, width: '80%' }}>
      <Grid container>
        {soulbounds.map((soulbound: any) => (
          <Soulbound palette={palette}>
            <SoulboundContent>
              {/* SVG Code */}
              <svg height="400px" width="300px">
                <image
                  height="400px"
                  width="300px"
                  xlinkHref="/SpectNFTCard.svg"
                />
                <text
                  x="50%"
                  y="8%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  fill="grey"
                  fontSize="16"
                  fontFamily="Poppins"
                >
                  {soulbound.deadline}
                </text>
                <g requiredFeatures="http://www.w3.org/Graphics/SVG/feature/1.2/#TextFlow">
                  <text
                    x="50%"
                    y="20%"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    fill="white"
                    fontFamily="Poppins"
                  >
                    {soulbound.title}
                  </text>
                </g>
                <text
                  x="50%"
                  y="45%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  fill="white"
                  fontSize="16"
                  fontFamily="Poppins"
                >
                  Issued By
                </text>
                <image
                  x="40%"
                  y="52%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  height="15%"
                  xlinkHref="/logo2.svg"
                />
                <text
                  x="50%"
                  y="80%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  fill="white"
                  fontSize="16"
                  fontFamily="Poppins"
                >
                  On
                </text>
                <image
                  x="33%"
                  y="85%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  height="10%"
                  xlinkHref="/logoSBT.svg"
                />
              </svg>
            </SoulboundContent>
          </Soulbound>
        ))}
      </Grid>
    </Box>
  );
}

export default FullWidthCards;
