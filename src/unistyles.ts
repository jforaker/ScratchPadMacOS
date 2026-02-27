import { UnistylesRegistry } from 'react-native-unistyles';
import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';
import { darkTheme, lightTheme } from './constants/theme';

UnistylesRegistry.addThemes({
  light: lightTheme,
  dark: darkTheme,
});

UnistylesRegistry.addConfig({
  adaptiveThemes: false,
});

const initialTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
UnistylesRuntime.setTheme(initialTheme);
