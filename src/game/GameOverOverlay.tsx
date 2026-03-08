import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { useGameStore } from './GameState';
import { TANK_CLASSES } from '../../shared/tankClasses';

interface Props {
  winner: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const GameOverOverlay: React.FC<Props> = ({ winner, onPlayAgain, onExit }) => {
  const players = useGameStore((s) => s.players);
  const winnerPlayer = players[winner];
  const winnerClass = TANK_CLASSES[winnerPlayer.tankClass];

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        <Text style={[styles.winnerText, { color: winnerPlayer.color }]}>
          {winnerPlayer.name} Wins!
        </Text>
        <Text style={styles.classText}>
          ({winnerClass.name})
        </Text>
        <Text style={styles.statsText}>
          P1 ({TANK_CLASSES[players[0].tankClass].name}) HP: {players[0].hp} | P2 ({TANK_CLASSES[players[1].tankClass].name}) HP: {players[1].hp}
        </Text>
        <View style={styles.buttons}>
          <Button title="Play Again" onPress={onPlayAgain} variant="primary" />
          <Button title="Main Menu" onPress={onExit} variant="secondary" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 280,
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ECEFF1',
    letterSpacing: 4,
  },
  winnerText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  classText: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 2,
  },
  statsText: {
    color: '#78909C',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 24,
  },
  buttons: {
    gap: 12,
    alignItems: 'center',
  },
});
