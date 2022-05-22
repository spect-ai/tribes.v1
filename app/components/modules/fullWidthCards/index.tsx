import styled from '@emotion/styled';
import { Palette, useTheme } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box } from '@mui/system';
import React from 'react';
import { Task } from '../../../types';

type Props = {
  cards: Task[];
};

const Card = styled.div<{ palette: Palette }>`
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

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
`;

function FullWidthCards({ cards }: Props) {
  const { palette } = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        mt: 2,
        ml: 16,
        width: '50rem',
      }}
    >
      {cards.map((card: any) => (
        <Card palette={palette}>
          <CardContent />
        </Card>
      ))}
    </Box>
  );
}

export default FullWidthCards;
