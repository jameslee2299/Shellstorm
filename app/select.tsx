import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/ui/Button';
import { TankCard } from '../src/ui/TankCard';
import { TankStatsPanel } from '../src/ui/TankStatsPanel';
import type { TankClassId } from '../shared/types';
import { TANK_CLASS_IDS } from '../shared/tankClasses';

type SelectPhase = 'p1' | 'p2';

export default function SelectScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<SelectPhase>('p1');
  const [p1Class, setP1Class] = useState<TankClassId | null>(null);
  const [p2Class, setP2Class] = useState<TankClassId | null>(null);

  const currentSelection = phase === 'p1' ? p1Class : p2Class;
  const setCurrentSelection = phase === 'p1' ? setP1Class : setP2Class;

  const handleConfirm = () => {
    if (phase === 'p1' && p1Class) {
      setPhase('p2');
    } else if (phase === 'p2' && p2Class) {
      router.replace(`/game?p1Class=${p1Class}&p2Class=${p2Class}`);
    }
  };

  const handleBack = () => {
    if (phase === 'p2') {
      setPhase('p1');
      setP2Class(null);
    } else {
      router.back();
    }
  };

  const playerLabel = phase === 'p1' ? 'Player 1' : 'Player 2';
  const playerColor = phase === 'p1' ? '#4FC3F7' : '#EF5350';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SELECT YOUR TANK</Text>
      <Text style={[styles.playerLabel, { color: playerColor }]}>
        {playerLabel} — Choose your class
      </Text>

      <View style={styles.content}>
        {/* Tank grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {TANK_CLASS_IDS.map((id) => (
              <TankCard
                key={id}
                classId={id}
                selected={currentSelection === id}
                onPress={() => setCurrentSelection(id)}
              />
            ))}
          </View>
        </View>

        {/* Stats panel */}
        <View style={styles.statsContainer}>
          <TankStatsPanel classId={currentSelection} />
        </View>
      </View>

      <View style={styles.buttons}>
        {currentSelection && (
          <Button
            title={phase === 'p2' ? 'START BATTLE' : 'CONFIRM'}
            onPress={handleConfirm}
            variant="primary"
          />
        )}
        <Button title="Back" onPress={handleBack} variant="secondary" />
      </View>

      {/* Show P1's selection during P2's turn */}
      {phase === 'p2' && p1Class && (
        <View style={styles.p1Selection}>
          <Text style={styles.p1SelectionText}>
            P1: {p1Class.charAt(0).toUpperCase() + p1Class.slice(1)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ECEFF1',
    letterSpacing: 4,
    marginBottom: 4,
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    marginBottom: 20,
  },
  gridContainer: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: 330,
    justifyContent: 'center',
  },
  statsContainer: {
    minWidth: 220,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  p1Selection: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  p1SelectionText: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
