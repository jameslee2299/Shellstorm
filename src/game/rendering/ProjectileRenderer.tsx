import React from 'react';
import { Group, Circle, Line, vec } from '@shopify/react-native-skia';
import type { ProjectileState } from '../../../shared/types';
import { PROJECTILE_RADIUS, COLORS } from '../constants';

interface Props {
  projectile: ProjectileState;
}

export const ProjectileRenderer: React.FC<Props> = ({ projectile }) => {
  if (!projectile.active && projectile.trail.length === 0) return null;

  return (
    <Group>
      {/* Trail */}
      {projectile.trail.map((point, i) => {
        if (i === 0) return null;
        const prev = projectile.trail[i - 1];
        const alpha = i / projectile.trail.length;
        return (
          <Line
            key={i}
            p1={vec(prev.x, prev.y)}
            p2={vec(point.x, point.y)}
            color={`rgba(255, 167, 38, ${alpha * 0.6})`}
            style="stroke"
            strokeWidth={2 * alpha}
          />
        );
      })}

      {/* Projectile body */}
      {projectile.active && (
        <>
          <Circle
            cx={projectile.x}
            cy={projectile.y}
            r={PROJECTILE_RADIUS + 3}
            color="rgba(255, 213, 79, 0.4)"
          />
          <Circle
            cx={projectile.x}
            cy={projectile.y}
            r={PROJECTILE_RADIUS}
            color={COLORS.projectile}
          />
        </>
      )}
    </Group>
  );
};
