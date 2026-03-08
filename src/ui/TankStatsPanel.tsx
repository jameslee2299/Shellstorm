import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TankClassId } from '../../shared/types';
import { TANK_CLASSES } from '../../shared/tankClasses';

interface Props {
  classId: TankClassId | null;
}

export const TankStatsPanel: React.FC<Props> = ({ classId }) => {
  if (!classId) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Select a tank</Text>
      </View>
    );
  }

  const cls = TANK_CLASSES[classId];

  return (
    <View style={[styles.container, { borderColor: cls.color }]}>
      <Text style={[styles.name, { color: cls.color }]}>{cls.name}</Text>
      <Text style={styles.description}>{cls.description}</Text>
      <View style={styles.statsRow}>
        <StatItem label="HP" value={`${cls.maxHp}`} />
        <StatItem label="Move" value={`${cls.moveDistance}px`} />
        <StatItem label="DMG" value={cls.directHitDamageMultiplier !== 1 ? `${cls.directHitDamageMultiplier}x` : '1x'} />
        <StatItem label="Blast" value={cls.explosionRadiusMultiplier !== 1 ? `${cls.explosionRadiusMultiplier}x` : '1x'} />
      </View>
    </View>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#1a1a2e',
    minWidth: 220,
  },
  placeholder: {
    color: '#546E7A',
    fontSize: 14,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#78909C',
    fontSize: 12,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#546E7A',
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    color: '#ECEFF1',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
