const classicDark = {
  spacing: 4,
  palette: {
    mode: 'dark' as any,
    primary: {
      main: 'rgb(0, 25, 74, 0.9)',
      light: 'rgb(153, 204, 255, 0.8)',
    },
    secondary: {
      main: 'rgb(234, 234, 234, 0.8)',
    },
    background: {
      default: 'rgb(0, 15, 41)',
    },
    text: {
      primary: 'rgb(234, 234, 234, 0.8)',
      secondary: 'rgb(153, 204, 255, 0.7)',
    },
    divider: 'rgb(90, 105, 114,0.7)',
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
