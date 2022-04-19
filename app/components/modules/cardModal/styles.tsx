import styled from '@emotion/styled';

import { Box, styled as MUIStyled } from '@mui/material';

// export const PopoverContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   padding: 16px 8px;
//   width: 18rem;
// `;

// @ts-ignore
export const PopoverContainer = MUIStyled(Box)(({ theme }) => ({
  width: '18rem',
  backgroundColor: theme.palette.primary.main,
  boxShadow: 24,
  overflow: 'auto',
  padding: '16px 8px',
  display: 'flex',
  flexDirection: 'column',
}));

export const LabelChip = styled.div`
  font-size: 12px;
  color: #eaeaea;
  margin: 0px 4px;
`;
