import 'react-native-unistyles';
import type {AppTheme} from '../constants/theme';

declare module 'react-native-unistyles' {
  interface UnistylesThemes {
    light: AppTheme;
    dark: AppTheme;
  }
}
