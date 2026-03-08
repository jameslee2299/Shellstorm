import React from 'react';
import { Group, Circle } from '@shopify/react-native-skia';
import type { ExplosionState } from '../../../shared/types';
import { COLORS } from '../constants';

interface Props {
  explosion: ExplosionState;
}

export const ExplosionRenderer: React.FC<Props> = ({ explosion }) => {
  const { x, y, radius, progress, particles } = explosion;

  // Fade out as progress increases
  const mainAlpha = Math.max(0, 1 - progress);
  const innerAlpha = Math.max(0, 1 - progress * 1.5);

  return (
    <Group>
      {/* Outer glow */}
      <Circle
        cx={x}
        cy={y}
        r={radius * 1.5}
        color={`rgba(255, 111, 0, ${mainAlpha * 0.2})`}
      />
      {/* Main explosion circle */}
      <Circle
        cx={x}
        cy={y}
        r={radius}
        color={`rgba(255, 111, 0, ${mainAlpha * 0.6})`}
      />
      {/* Inner bright core */}
      <Circle
        cx={x}
        cy={y}
        r={radius * 0.5}
        color={`rgba(255, 213, 79, ${innerAlpha * 0.8})`}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.radius * p.life}
          color={`rgba(${p.color}, ${p.life})`}
        />
      ))}
    </Group>
  );
};
