import type { ColorValue } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

/**
 * Icon wrapper. The prototype uses Material Symbols Rounded; we render the closely
 * matching MaterialIcons set bundled with Expo so icon usage stays consistent.
 */
export function Icon({ name, size = 22, color }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
