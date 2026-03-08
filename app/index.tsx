import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/ui/Button';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SHELL</Text>
        <Text style={styles.titleAccent}>STORM</Text>
        <Text style={styles.subtitle}>Turn-Based Tank Combat</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Local Game"
          onPress={() => router.push('/select')}
          variant="primary"
        />
        <Button
          title="Online Match"
          onPress={() => router.push('/lobby')}
          variant="secondary"
        />
      </View>

      <Text style={styles.footer}>Pick your tank class • Drag to aim • Hold FIRE to charge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ECEFF1',
    letterSpacing: 8,
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4FC3F7',
    letterSpacing: 4,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 8,
    letterSpacing: 2,
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    color: '#546E7A',
    fontSize: 12,
  },
});
