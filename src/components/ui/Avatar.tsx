import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  /** Initial letter shown when there's no photo. */
  initial: string;
  /** Profile accent color (background). */
  color: string;
  size?: number;
  photoUri?: string | null;
}

/** Circular avatar with initial + profile color, or a photo when available. */
export function Avatar({ initial, color, size = 44, photoUri }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (photoUri) {
    return <Image source={{ uri: photoUri }} style={[dimension, styles.image]} />;
  }

  return (
    <View style={[dimension, styles.circle, { backgroundColor: color }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  image: { backgroundColor: '#ccc' },
  initial: { color: '#ffffff', fontWeight: '700' },
});
