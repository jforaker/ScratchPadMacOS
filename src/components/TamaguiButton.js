import React from 'react';
import { Button } from '@tamagui/button';

const DEFAULT_PRESS_STYLE = { opacity: 0.9, scale: 0.98 };

export default function TamaguiButton(props) {
  if (props.unstyled) {
    return <Button {...props} />;
  }

  return (
    <Button
      fontFamily="$body"
      animation="quick"
      pressStyle={DEFAULT_PRESS_STYLE}
      {...props}
    />
  );
}
