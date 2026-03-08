import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../src/ui/Button';

export default function ResultScreen() {
  const router = useRouter();
  const { winner, p1hp, p2hp } = useLocalSearchParams<{
    winner: string;
    p1hp: string;
    p2hp: string;
  }>();

  const winnerIndex = parseInt(winner || '0', 10);
  const winnerName = winnerIndex === 0 ? 'Player 1' : 'Player 2';
  const winnerColor = winnerIndex === 0 ? '#4FC3F7' : '#EF5350';

  return (
    <View style={styles.container}>
      <Text style={styles.gameOverText}>GAME OVER</Text>
      <Text style={[styles.winnerText, { color: winnerColor }]}>
        {winnerName} Wins!
      </Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Player 1 HP: {p1hp || '0'}</Text>
        <Text style={styles.statsText}>Player 2 HP: {p2hp || '0'}</Text>
      </View>

      <View style={styles.buttons}>
        <Button title="Play Again" onPress={() => router.replace('/select')} variant="primary" />
        <Button title="Main Menu" onPress={() => router.replace('/')} variant="secondary" />
      </View>
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
  gameOverText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ECEFF1',
    letterSpacing: 6,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
  },
  statsContainer: {
    marginTop: 24,
    marginBottom: 32,
    gap: 8,
  },
  statsText: {
    color: '#78909C',
    fontSize: 16,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
    alignItems: 'center',
  },
});
