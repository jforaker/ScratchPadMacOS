import React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface SidebarFooterProps {
  onAddNote: () => void;
}

const TamaguiButton = require('../../../components/TamaguiButton').default;
const AppIcon = require('../../../components/AppIcon').default;
const PRESSED_STYLE = { opacity: 0.85 };

export default function SidebarFooter({ onAddNote }: SidebarFooterProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View
      style={[
        styles.sidebarFooter,
        {
          borderTopColor: theme.colors.headerBorder,
          backgroundColor: theme.colors.addButtonBackground,
        },
      ]}
    >
      <TamaguiButton
        size="$3"
        onPress={onAddNote}
        borderRadius={theme.radius.md}
        backgroundColor={theme.colors.iconButtonBackground}
        color={theme.colors.text}
        style={styles.addButton}
        pressStyle={PRESSED_STYLE}
      >
        <AppIcon
          name="add-circle-outline"
          size={16}
          color={theme.colors.text}
        />{' '}
        Add Note
      </TamaguiButton>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  addButton: {
    width: '100%',
  },
  sidebarFooter: {
    borderTopWidth: theme.layout.hairlineWidth,
    padding: 10,
  },
}));
