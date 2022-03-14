import styled from "@emotion/styled";
import {
  Button,
  ButtonProps,
  Palette,
  Popover,
  styled as MuiStyled,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

const ThemePopover = ({ open, anchorEl, handleClose }: Props) => {
  const { palette } = useTheme();
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <PopoverContainer palette={palette}>
        <OptionsButton color="inherit">
          <ThemeColor color="#000f29" />
          <Typography fontSize={14} sx={{ width: "70%" }}>
            Classic Dark
          </Typography>
        </OptionsButton>
        <OptionsButton color="inherit">
          <ThemeColor color="#38006b" />
          <Typography fontSize={14} sx={{ width: "70%" }}>
            Warm Purple
          </Typography>
        </OptionsButton>
        <OptionsButton color="inherit">
          <ThemeColor color="#0288d1" />
          <Typography fontSize={14} sx={{ width: "70%" }}>
            Ocean Blue
          </Typography>
        </OptionsButton>
      </PopoverContainer>
    </Popover>
  );
};

export const PopoverContainer = styled.div<{ palette: Palette }>`
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
  textTransform: "none",
}));

export default ThemePopover;
