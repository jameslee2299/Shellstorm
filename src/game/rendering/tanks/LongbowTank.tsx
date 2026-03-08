import React from 'react';
import {
  Group,
  RoundedRect,
  Rect,
  Circle,
  Line,
  vec,
  Shadow,
} from '@shopify/react-native-skia';
import type { TankComponentProps } from './tankColors';
import { TANK_PALETTES } from './tankColors';

const palette = TANK_PALETTES.longbow;

const bodyWidth = 38;
const bodyHeight = 18;
const barrelLength = 36;
const barrelWidth = 4;
const turretRadius = 9;

export const LongbowTank: React.FC<TankComponentProps> = ({
  x,
  y,
  angle,
  hp,
  maxHp,
  isActive,
  facingRight,
}) => {
  const bodyX = x - bodyWidth / 2;
  const bodyY = y - bodyHeight;
  const turretY = y - bodyHeight;

  const hpRatio = hp / maxHp;
  const hpBarWidth = 48;
  const hpBarHeight = 4;
  const hpBarX = x - hpBarWidth / 2;
  const hpBarY = y - bodyHeight - 18;
  const hpColor = hpRatio > 0.3 ? '#22C55E' : '#EF4444';

  const barrelEndX = x + Math.cos(angle) * barrelLength;
  const barrelEndY = turretY - Math.sin(angle) * barrelLength;

  // Scope guide: perpendicular offset from barrel, half length
  const perpX = -Math.sin(angle);
  const perpY = -Math.cos(angle);
  const scopeGuideStartX = x + perpX * 3;
  const scopeGuideStartY = turretY + perpY * 3;
  const halfBarrel = barrelLength / 2;
  const scopeGuideEndX = scopeGuideStartX + Math.cos(angle) * halfBarrel;
  const scopeGuideEndY = scopeGuideStartY - Math.sin(angle) * halfBarrel;

  const wheelY = y - 3;
  const wheelRadius = 4;
  const wheelXPositions = [x - 14, x - 5, x + 5, x + 14];

  return (
    <Group>
      {/* HP Bar background */}
      <Rect
        x={hpBarX}
        y={hpBarY}
        width={hpBarWidth}
        height={hpBarHeight}
        color="#333333"
      />
      {/* HP Bar fill */}
      <Rect
        x={hpBarX}
        y={hpBarY}
        width={hpBarWidth * hpRatio}
        height={hpBarHeight}
        color={hpColor}
      />

      {/* Track strip */}
      <RoundedRect
        x={bodyX - 2}
        y={y - 5}
        width={bodyWidth + 4}
        height={7}
        r={3}
        color={palette.track}
      />

      {/* Wheels */}
      {wheelXPositions.map((wx, i) => (
        <Circle
          key={i}
          cx={wx}
          cy={wheelY}
          r={wheelRadius}
          color={palette.track}
        />
      ))}

      {/* Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        r={3}
        color={palette.body}
      >
        {isActive && (
          <Shadow dx={0} dy={0} blur={8} color="rgba(255, 255, 255, 0.4)" />
        )}
      </RoundedRect>

      {/* Elongated turret housing - circle base */}
      <Circle cx={x} cy={turretY} r={turretRadius} color={palette.turret} />
      {/* Elongated turret housing - rect extension */}
      <Rect
        x={x}
        y={turretY - 5}
        width={14}
        height={10}
        color={palette.turret}
      />

      {/* Extra-long barrel */}
      <Line
        p1={vec(x, turretY)}
        p2={vec(barrelEndX, barrelEndY)}
        color={palette.barrel}
        style="stroke"
        strokeWidth={barrelWidth}
        strokeCap="round"
      />

      {/* Parallel scope guide */}
      <Line
        p1={vec(scopeGuideStartX, scopeGuideStartY)}
        p2={vec(scopeGuideEndX, scopeGuideEndY)}
        color={`${palette.accent}99`}
        style="stroke"
        strokeWidth={1.5}
      />

      {/* Scope circle */}
      <Circle
        cx={x + 3}
        cy={turretY - turretRadius + 1}
        r={3}
        color={palette.accent}
      />

      {/* Rangefinder */}
      <Rect
        x={x - bodyWidth / 4}
        y={bodyY + 2}
        width={4}
        height={6}
        color={palette.bodyDark}
      />
    </Group>
  );
};
