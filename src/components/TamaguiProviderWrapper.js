import React from 'react';
import { TamaguiProvider, Theme } from '@tamagui/core';
import tamaguiConfig from '../../tamagui.config';

export default function TamaguiProviderWrapper({ themeName, children }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <Theme name={themeName}>{children}</Theme>
    </TamaguiProvider>
  );
}
