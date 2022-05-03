const classicDark = {
  spacing: 4,
  palette: {
    mode: 'dark' as any,
    primary: {
      main: '#00194A',
      light: '#99ccff',
    },
    secondary: {
      main: '#eaeaea',
    },
    background: {
      default: '#000f29',
    },
    text: {
      primary: 'rgb(234, 234, 234, 1)',
      secondary: '#99ccff',
    },
    divider: '#5a6972',
  },
};

const warmPurple = {
  spacing: 4,
  palette: {
    mode: 'dark' as any,
    primary: {
      main: '#6a1b9a',
      light: '#9c4dcc',
    },
    secondary: {
      main: '#5a48a7',
      dark: '#301b70',
    },
    background: {
      default: '#38006b',
    },
    text: {
      primary: '#f3e5f5',
      secondary: '#ea80fc',
    },
    divider: '#5a6972',
  },
};

const oceanBlue = {
  spacing: 4,
  palette: {
    mode: 'dark' as any,
    primary: {
      main: '#0077c2',
      light: '#81d4fa',
    },
    secondary: {
      main: '#29b6f6',
      dark: '#29b6f6',
    },
    background: {
      default: '#0288d1',
    },
    text: {
      primary: '#f3e5f5',
      secondary: '#e3f2fd',
    },
    divider: '#5a6972',
  },
};

export default function getTheme(themeType: number) {
  if (themeType === 0) {
    return classicDark;
  }
  if (themeType === 1) {
    return warmPurple;
  }
  if (themeType === 2) {
    return oceanBlue;
  }
  return classicDark;
}
