import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { TankClassId, TankClassDef } from '../../shared/types';
import { TANK_CLASSES } from '../../shared/tankClasses';

interface Props {
  classId: TankClassId;
  selected: boolean;
  onPress: () => void;
}

export const TankCard: React.FC<Props> = ({ classId, selected, onPress }) => {
  const classDef = TANK_CLASSES[classId];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: selected ? classDef.color : '#333' },
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.colorSwatch, { backgroundColor: classDef.color }]} />
      <Text style={styles.name}>{classDef.name}</Text>
      <Text style={styles.hp}>HP: {classDef.maxHp}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cardSelected: {
    backgroundColor: '#252545',
  },
  colorSwatch: {
    width: 32,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  name: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hp: {
    color: '#78909C',
    fontSize: 10,
    marginTop: 2,
  },
});
