/* eslint-disable */
import styled from '@emotion/styled';
import { Palette, useTheme, Grid } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box } from '@mui/system';
import React from 'react';
import { SoulboundInfo } from '../../../types';

type Props = {
  soulbounds: SoulboundInfo[];
};

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

function FullWidthCards({ soulbounds }: Props) {
  const { palette } = useTheme();

  // TESTING: Add task data structure here
  // const soulbounds: SoulboundInfo[] = [
  //   {
  //     claimee: 'abcd',
  //     contentUri: 'contentUri',
  //     title: 'test',
  //     deadline: '2020-01-01',
  //     description: 'test',
  //     issuer: 'abcd',
  //     id: 1,
  //   },
  //   {
  //     claimee: 'efgh',
  //     contentUri: 'contentUri',
  //     title: 'Create an awesome landing page',
  //     deadline: '2020-01-03',
  //     description: 'test',
  //     issuer: 'qwewr',
  //     id: 2,
  //   },
  // ];
  return (
    <Box sx={{ mx: 4, mt: 2, width: '80%' }}>
      <Grid container>
        {soulbounds.map((soulbound: any) => (
          <Soulbound palette={palette}>
            <SoulboundContent>
              {/* SVG Code */}
              <svg height="384px" width="300px">
                <image
                  height="384px"
                  width="300px"
                  xlinkHref="/SpectNFTCard.svg"
                  preserveAspectRatio="xMinYMin slice"
                />
                <text
                  x="150px"
                  textAnchor="middle"
                  y="40"
                  fill="rgba(255, 255, 255, 0.80)"
                  fontSize="12"
                  fontFamily="Poppins"
                >
                  {soulbound.deadline}
                </text>
                <text
                  fill="white"
                  fontFamily="Poppins"
                  font-weight="bold"
                  x="150px"
                  textAnchor="middle"
                  fontSize="20"
                >
                  <tspan y="90" x="150px" textAnchor="middle">
                    {soulbound.title.split(' ').slice(0, 3).join(' ')}
                  </tspan>
                  <tspan y="120" x="150px" textAnchor="middle">
                    {soulbound.title.split(' ').slice(3, 6).join(' ')}
                  </tspan>
                  <tspan y="150" x="150px" textAnchor="middle">
                    {soulbound.title.split(' ').length > 8
                      ? soulbound.title.split(' ').slice(6, 8).join(' ') + ' ..'
                      : soulbound.title.split(' ').slice(6, 8).join(' ')}
                  </tspan>
                </text>
                <text
                  x="150px"
                  y="220"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontFamily="Poppins"
                >
                  Issued By
                </text>
                <rect
                  x="60"
                  y="240"
                  height="45px"
                  width="175px"
                  stroke="rgba(255, 255, 255, 0.2)"
                  stroke-width="1"
                  rx="25"
                  ry="25"
                  fill="rgba(255, 255, 255, 0.1)"
                />
                <image
                  x={`${
                    120 -
                    (soulbound.issuer.length > 9
                      ? soulbound.issuer.substring(0, 9)
                      : soulbound.issuer
                    ).length *
                      5
                  }`}
                  y="250"
                  height="25px"
                  xlinkHref={`${soulbound.contentUri}`}
                />
                <text
                  x={`${
                    160 -
                    (soulbound.issuer.length > 9
                      ? soulbound.issuer.substring(0, 9)
                      : soulbound.issuer
                    ).length *
                      5
                  }`}
                  y="268"
                  textAnchor="start"
                  fill="white"
                  fontSize="18"
                  fontFamily="Poppins"
                >
                  {soulbound.issuer.length > 9
                    ? soulbound.issuer.substring(0, 8) + '..'
                    : soulbound.issuer}
                </text>
                <text
                  x="50%"
                  y="87%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  fill="white"
                  fontSize="16"
                  fontFamily="Poppins"
                >
                  On
                </text>
                <image x="90" y="90%" height="40px" xlinkHref="/logoSBT.svg" />
              </svg>
              {/* <svg height="400px" width="300px">
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
                {['abcd', 'efgh'].map((chunk: string) => {
                  <text
                    x="50%"
                    y="20%"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    fill="white"
                    fontFamily="Poppins"
                  >
                    {chunk}
                  </text>;
                })}
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
                ;
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
              </svg> */}
            </SoulboundContent>
          </Soulbound>
        ))}
      </Grid>
    </Box>
  );
}

export default FullWidthCards;
