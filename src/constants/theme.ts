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
  fontFamily: undefined, // system font
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
  background: '#FFFCEE',
  text: '#1F1F1F',
  headerBackground: '#FFF9E0',
  headerBorder: '#E8E4D4',
  clearButton: '#C44B3F',
  clearButtonPressed: '#A33D33',
  placeholder: '#999999',
  sidebarSelected: '#EFE9D2',
  addButtonBackground: '#F8F1D7',
  iconButtonBackground: '#ECE4C4',
  clearButtonText: '#FFFFFF',
} as const;

export const darkColors = {
  background: '#1B1B1B',
  text: '#F1F1F1',
  headerBackground: '#242424',
  headerBorder: '#343434',
  clearButton: '#B34A3E',
  clearButtonPressed: '#923B32',
  placeholder: '#8F8F8F',
  sidebarSelected: '#303030',
  addButtonBackground: '#2A2A2A',
  iconButtonBackground: '#353535',
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
