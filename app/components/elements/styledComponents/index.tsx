/* eslint-disable react/react-in-jsx-scope */
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  ButtonProps,
  Modal,
  styled,
  Tab,
  Tabs,
  Tooltip,
  tooltipClasses,
  TooltipProps,
} from '@mui/material';
import React from 'react';

export const PrimaryButton = styled(LoadingButton)<ButtonProps>(
  ({ theme }) => ({
    color: theme.palette.getContrastText(theme.palette.background.paper),
    borderRadius: '2',
    textTransform: 'none',
  })
);

export const TaskButton = styled(LoadingButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  marginBottom: '6px',
}));

export const CardButton = styled(LoadingButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  marginBottom: '6px',
  marginRight: '5px',
}));

type BProps = {
  buttonColor: string;
};
export const LabelChipButton = styled(LoadingButton)((props: BProps) => ({
  backgroundColor: props.buttonColor,
  textTransform: 'none',
  width: '12rem',
}));

export const FieldContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.5rem 0.5rem',
}));

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#eaeaea',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: '0.8rem',
    maxWidth: '22rem',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#eaeaea',
  },
}));

export const NavbarButton = styled(LoadingButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText('#000f29'),
  borderRadius: '22.5px',
  textTransform: 'none',
  border: '1px solid #99ccff',
  width: '155px',
  height: '35px',
}));

export const SidebarButton = styled(LoadingButton)<ButtonProps>(
  ({ theme }) => ({
    color: theme.palette.getContrastText('#000f29'),
    pt: 2,
    margin: 0,
    minWidth: 0,
  })
);

export const StyledAccordian = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  boxShadow: theme.shadows[1],
}));

export const ListAccordian = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxShadow: 'none',
}));

interface StyledTabProps {
  icon?: any;
  iconPosition?: 'start' | 'end';
  label: string;
  disabled?: boolean;
}

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  centered?: boolean;
}

export const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  minHeight: '2.8rem !important',
  height: '2.8rem !importantt',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 70,
    width: '100%',
    backgroundColor: theme.palette.primary.light,
  },
}));

export const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  minHeight: '2.8rem !important',
  height: '2.8rem !important',
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(14),
  margin: '0rem !important',
  padding: '0rem !important',
  color: 'rgba(255, 255, 255, 0.6)',
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

export const ModalHeading = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: '1px solid #5a6972',
  padding: 16,
  paddingLeft: 32,
}));

export const StyledNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '3rem',
  width: '100%',
  paddingTop: '0.4rem',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));
