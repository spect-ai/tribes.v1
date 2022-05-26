import { Box, styled } from '@mui/material';

// @ts-ignore
const PopoverContainer = styled(Box)(({ theme }) => ({
  width: '28rem',
  backgroundColor: theme.palette.primary.main,
  boxShadow: 24,
  overflow: 'auto',
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
}));

export default PopoverContainer;
