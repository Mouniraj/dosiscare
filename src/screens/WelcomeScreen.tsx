/**
 * @format
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PeopleIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#FFFFFF" />
      <Path
        d="M9 13c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4Z"
        fill="#FFFFFF"
      />
      <Path
        d="M16.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        fill="#FFFFFF"
        fillOpacity={0.7}
      />
      <Path
        d="M16.7 12.5c-.55 0-1.08.06-1.57.17.82.92 1.22 2 1.22 3.33v1h4.65v-1c0-2.06-2.16-3.5-4.3-3.5Z"
        fill="#FFFFFF"
        fillOpacity={0.7}
      />
    </Svg>
  );
}

type WelcomeScreenProps = {
  onStart?: () => void;
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#4C6BF5', '#1D3AA8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconSquare}>
            <PeopleIcon />
          </View>
          <View style={styles.badge} />
        </View>

        <Text style={styles.title}>DosisCare</Text>
        <Text style={styles.subtitle}>
          Convierte la receta médica en{'\n'}recordatorios inteligentes.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onStart}
          activeOpacity={0.85}>
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    marginBottom: 32,
  },
  iconSquare: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9FE6B8',
    borderWidth: 3,
    borderColor: '#3355D8',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  buttonText: {
    color: '#2C4BD4',
    fontSize: 17,
    fontWeight: '700',
  },
});
