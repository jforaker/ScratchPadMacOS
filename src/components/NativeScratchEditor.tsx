import React, { useCallback } from 'react';
import {
  requireNativeComponent,
  type ViewStyle,
  type StyleProp,
  type NativeSyntheticEvent,
} from 'react-native';

interface NativeScratchEditorNativeProps {
  text: string;
  placeholder?: string;
  fontSize?: number;
  darkMode?: boolean;
  onChange?: (event: NativeSyntheticEvent<{ text: string }>) => void;
  style?: StyleProp<ViewStyle>;
}

const NativeScratchEditorView =
  requireNativeComponent<NativeScratchEditorNativeProps>('NativeScratchEditor');

interface NativeScratchEditorProps {
  text: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  fontSize?: number;
  darkMode?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function NativeScratchEditor({
  text,
  onChangeText,
  placeholder,
  fontSize = 15,
  darkMode = false,
  style,
}: NativeScratchEditorProps) {
  const handleChange = useCallback(
    (event: NativeSyntheticEvent<{ text: string }>) => {
      onChangeText?.(event.nativeEvent.text);
    },
    [onChangeText],
  );

  return (
    <NativeScratchEditorView
      text={text}
      placeholder={placeholder}
      fontSize={fontSize}
      darkMode={darkMode}
      onChange={handleChange}
      style={style}
    />
  );
}
