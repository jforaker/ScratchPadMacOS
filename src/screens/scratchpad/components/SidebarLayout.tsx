import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface SidebarLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export default function SidebarLayout({
  children,
  footer,
}: SidebarLayoutProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View
      style={[
        styles.sidebar,
        {
          borderRightColor: theme.colors.headerBorder,
          backgroundColor: theme.colors.headerBackground,
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
      {footer}
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  sidebar: {
    flexShrink: 0,
    width: theme.layout.sidebarWidth,
    height: '100%',
    borderRightWidth: theme.layout.hairlineWidth,
    borderRightColor: theme.colors.headerBorder,
    backgroundColor: theme.colors.headerBackground,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
}));
