import React from 'react';
import Ionicon from '@react-native-vector-icons/ionicons';

interface AppIconProps {
  name: React.ComponentProps<typeof Ionicon>['name'];
  size?: number;
  color?: string;
}

export default function AppIcon({
  name,
  size = 16,
  color = '#000000',
}: AppIconProps) {
  return <Ionicon name={name} size={size} color={color} />;
}
