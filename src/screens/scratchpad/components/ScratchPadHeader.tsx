import React from 'react';
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import type { ThemeMode } from '../../../constants/theme';

const TamaguiButton = require('../../../components/TamaguiButton').default;
const AppIcon = require('../../../components/AppIcon').default;
const PRESSED_STYLE = { opacity: 0.85 };

interface ScratchPadHeaderProps {
  isSidebarCollapsed: boolean;
  themeMode: ThemeMode;
  onToggleSidebar: () => void;
  onDelete: () => void;
  onClear: () => void;
  onToggleTheme: () => void;
}

export default function ScratchPadHeader({
  isSidebarCollapsed,
  themeMode,
  onToggleSidebar,
  onDelete,
  onClear,
  onToggleTheme,
}: ScratchPadHeaderProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View style={styles.header}>
      <TamaguiButton
        unstyled
        onPress={onToggleSidebar}
        style={styles.sidebarToggle}
        accessibilityLabel={
          isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
        }
      >
        <AppIcon
          name={isSidebarCollapsed ? 'chevron-forward' : 'chevron-back'}
          size={18}
          color={theme.colors.text}
        />
      </TamaguiButton>
      <Text style={styles.title}>Scratch Pad</Text>
      <View style={styles.headerRight}>
        <TamaguiButton
          size="$3"
          onPress={onDelete}
          borderRadius={theme.radius.pill}
          backgroundColor="#8F342C"
          color="#FFFFFF"
          pressStyle={PRESSED_STYLE}
        >
          <AppIcon name="trash-outline" size={16} color="#FFFFFF" /> Delete
        </TamaguiButton>
        <TamaguiButton
          size="$3"
          onPress={onClear}
          borderRadius={theme.radius.pill}
          backgroundColor={theme.colors.clearButton}
          color={theme.colors.clearButtonText}
          pressStyle={PRESSED_STYLE}
        >
          <AppIcon
            name="sparkles-outline"
            size={16}
            color={theme.colors.clearButtonText}
          />{' '}
          Clear
        </TamaguiButton>
        <TamaguiButton
          size="$3"
          onPress={onToggleTheme}
          borderRadius={theme.radius.pill}
          backgroundColor={theme.colors.iconButtonBackground}
          color={theme.colors.text}
          pressStyle={PRESSED_STYLE}
          accessibilityLabel={
            themeMode === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          <AppIcon
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={16}
            color={theme.colors.text}
          />{' '}
          {themeMode === 'dark' ? 'Light' : 'Dark'}
        </TamaguiButton>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.headerPaddingVertical,
    paddingHorizontal: theme.spacing.headerPaddingHorizontal,
    backgroundColor: theme.colors.headerBackground,
    borderBottomWidth: theme.layout.hairlineWidth,
    borderBottomColor: theme.colors.headerBorder,
    gap: 8,
  },
  title: {
    fontSize: theme.typography.headerFontSize,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  sidebarToggle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.iconButtonBackground,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
}));
