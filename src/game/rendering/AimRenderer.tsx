import React, { useMemo } from 'react';
import { Group, Circle, Line, vec, DashPathEffect } from '@shopify/react-native-skia';
import { projectilePosition } from '../../../shared/physics';
import { TANK_BARREL_LENGTH, WORLD_WIDTH, WORLD_HEIGHT, COLORS } from '../constants';

interface Props {
  tankX: number;
  tankY: number;
  angle: number;
  power: number;
  wind: number;
  terrain: number[];
  visible: boolean;
}

export const AimRenderer: React.FC<Props> = ({
  tankX,
  tankY,
  angle,
  power,
  wind,
  terrain,
  visible,
}) => {
  const previewDots = useMemo(() => {
    if (!visible || power <= 0) return [];

    const startX = tankX + Math.cos(angle) * TANK_BARREL_LENGTH;
    const startY = tankY - Math.sin(angle) * TANK_BARREL_LENGTH;
    const dots: { x: number; y: number }[] = [];
    const dt = 0.05;

    for (let t = 0; t < 3; t += dt) {
      const pos = projectilePosition(startX, startY, angle, power, wind, t);
      if (pos.x < -50 || pos.x > WORLD_WIDTH + 50 || pos.y > WORLD_HEIGHT + 50) break;

      // Check terrain
      if (pos.x >= 0 && pos.x < WORLD_WIDTH) {
        const idx = Math.floor((pos.x / WORLD_WIDTH) * terrain.length);
        const ci = Math.max(0, Math.min(terrain.length - 1, idx));
        const terrainY = WORLD_HEIGHT - terrain[ci];
        if (pos.y >= terrainY) break;
      }

      dots.push(pos);
    }

    return dots;
  }, [tankX, tankY, angle, power, wind, terrain, visible]);

  if (!visible) return null;

  // Barrel line
  const barrelEndX = tankX + Math.cos(angle) * TANK_BARREL_LENGTH;
  const barrelEndY = tankY - Math.sin(angle) * TANK_BARREL_LENGTH;

  return (
    <Group>
      {/* Aim direction line */}
      <Line
        p1={vec(barrelEndX, barrelEndY)}
        p2={vec(
          tankX + Math.cos(angle) * (TANK_BARREL_LENGTH + 20),
          tankY - Math.sin(angle) * (TANK_BARREL_LENGTH + 20)
        )}
        color="rgba(255, 255, 255, 0.3)"
        style="stroke"
        strokeWidth={1}
      >
        <DashPathEffect intervals={[4, 4]} />
      </Line>

      {/* Trajectory preview dots */}
      {previewDots.map((dot, i) => {
        if (i % 3 !== 0) return null; // Show every 3rd dot
        const alpha = Math.max(0.1, 1 - i / previewDots.length);
        return (
          <Circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={2}
            color={`rgba(255, 255, 255, ${alpha * 0.5})`}
          />
        );
      })}
    </Group>
  );
};
