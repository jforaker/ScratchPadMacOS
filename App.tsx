import React from 'react';
import { useColorScheme } from 'react-native';
import './src/unistyles';
import ScratchPad from './src/screens/ScratchPad';

const TamaguiProviderWrapper =
  require('./src/components/TamaguiProviderWrapper').default;

export default function App() {
  const systemColorScheme = useColorScheme();
  const themeName = systemColorScheme === 'dark' ? 'dark' : 'light';

  return (
    <TamaguiProviderWrapper themeName={themeName}>
      <ScratchPad />
    </TamaguiProviderWrapper>
  );
}
