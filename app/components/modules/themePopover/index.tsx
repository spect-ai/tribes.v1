import styled from '@emotion/styled';
import {
  Button,
  ButtonProps,
  Palette,
  Popover,
  styled as MuiStyled,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { updateThemeFromSpace } from '../../../adapters/moralis';
import { BoardData } from '../../../types';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

const ThemePopover = ({ open, anchorEl, handleClose, type }: Props) => {
  const { palette } = useTheme();
  const { setSpace, themeChanged, setThemeChanged } = useSpace();
  const router = useRouter();
  const { Moralis } = useMoralis();
  const bid = router.query.bid as string;
  const id = router.query.id as string;
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <SidebarPopoverContainer palette={palette}>
        <OptionsButton color="inherit">
          <ThemeColor color="#000f29" />
          <Typography
            fontSize={14}
            sx={{ width: '70%' }}
            onClick={() => {
              updateThemeFromSpace(Moralis, bid, id, 0).then(
                (res: BoardData) => {
                  setSpace(res);
                  localStorage.setItem('theme', '0');
                  setThemeChanged(!themeChanged);
                }
              );
              handleClose(type);
            }}
          >
            Classic Dark
          </Typography>
        </OptionsButton>
        <OptionsButton color="inherit">
          <ThemeColor color="#38006b" />
          <Typography
            fontSize={14}
            sx={{ width: '70%' }}
            onClick={() => {
              updateThemeFromSpace(Moralis, bid, id, 1).then(
                (res: BoardData) => {
                  setSpace(res);
                  localStorage.setItem('theme', '1');
                  setThemeChanged(!themeChanged);
                }
              );
              handleClose(type);
            }}
          >
            Warm Purple
          </Typography>
        </OptionsButton>
        <OptionsButton color="inherit">
          <ThemeColor color="#0288d1" />
          <Typography
            fontSize={14}
            sx={{ width: '70%' }}
            onClick={() => {
              updateThemeFromSpace(Moralis, bid, id, 2).then(
                (res: BoardData) => {
                  setSpace(res);
                  console.log(res);
                  localStorage.setItem('theme', '2');
                  setThemeChanged(!themeChanged);
                }
              );
              handleClose(type);
            }}
          >
            Ocean Blue
          </Typography>
        </OptionsButton>
      </SidebarPopoverContainer>
    </Popover>
  );
};

export const SidebarPopoverContainer = styled.div<{ palette: Palette }>`
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  width: 14rem;
  background-color: ${({ palette }) => palette.background.default};
`;

export const ThemeColor = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 2px;
  height: 18px;
  width: 18px;
  margin-right: 8px;
  border: 1px solid #5a6972;
`;
export const OptionsButton = MuiStyled(Button)<ButtonProps>(({ theme }) => ({
  pt: 2,
  textTransform: 'none',
}));

export default ThemePopover;
