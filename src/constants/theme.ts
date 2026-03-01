export type ThemeMode = 'light' | 'dark';

const baseSpacing = {
  padding: 16,
  headerPaddingVertical: 10,
  headerPaddingHorizontal: 16,
  noteItemVertical: 10,
  noteItemHorizontal: 12,
  buttonHorizontal: 12,
} as const;

const baseTypography = {
  fontSize: 15,
  headerFontSize: 16,
  listFontSize: 13,
  fontFamily: 'Noto Sans',
} as const;

const baseRadius = {
  sm: 4,
  md: 8,
  pill: 15,
} as const;

const baseLayout = {
  sidebarWidth: 220,
  iconButtonSize: 30,
  sidebarToggleWidth: 28,
  hairlineWidth: 0.5,
} as const;

export const lightColors = {
  background: '#F8F4E6',
  text: '#2B2A26',
  headerBackground: '#FFF9E8',
  headerBorder: '#E6DEC8',
  clearButton: '#BE4A3F',
  clearButtonPressed: '#A33D33',
  placeholder: '#8D8778',
  sidebarSelected: '#EFE4C6',
  addButtonBackground: '#F2E7C9',
  iconButtonBackground: '#E9DDBD',
  clearButtonText: '#FFFFFF',
} as const;

export const darkColors = {
  background: '#171715',
  text: '#ECE7D8',
  headerBackground: '#1E1E1B',
  headerBorder: '#30302C',
  clearButton: '#A5483F',
  clearButtonPressed: '#923B32',
  placeholder: '#8D897C',
  sidebarSelected: '#2A2924',
  addButtonBackground: '#24231F',
  iconButtonBackground: '#33312A',
  clearButtonText: '#FFFFFF',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof baseSpacing;
  typography: typeof baseTypography;
  radius: typeof baseRadius;
  layout: typeof baseLayout;
}

const baseTheme = {
  spacing: baseSpacing,
  typography: baseTypography,
  radius: baseRadius,
  layout: baseLayout,
} as const;

export const lightTheme: AppTheme = {
  ...baseTheme,
  colors: lightColors,
};

export const darkTheme: AppTheme = {
  ...baseTheme,
  colors: darkColors,
};

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export function getTheme(mode: ThemeMode): AppTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
