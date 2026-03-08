import React from 'react';
import {
  Group,
  RoundedRect,
  Rect,
  Circle,
  Line,
  vec,
  Shadow,
  LinearGradient,
} from '@shopify/react-native-skia';
import type { TankComponentProps } from './tankColors';
import { TANK_PALETTES } from './tankColors';

const palette = TANK_PALETTES.soldier;

const bodyWidth = 40;
const bodyHeight = 20;
const barrelLength = 28;
const barrelWidth = 6;
const turretRadius = 10;

export const SoldierTank: React.FC<TankComponentProps> = ({
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
  const hpBarWidth = 50;
  const hpBarHeight = 4;
  const hpBarX = x - hpBarWidth / 2;
  const hpBarY = y - bodyHeight - 18;
  const hpColor = hpRatio > 0.3 ? '#22C55E' : '#EF4444';

  const barrelEndX = x + Math.cos(angle) * barrelLength;
  const barrelEndY = turretY - Math.sin(angle) * barrelLength;

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
        r={4}
        color={palette.body}
      >
        <LinearGradient
          start={vec(bodyX, bodyY)}
          end={vec(bodyX, bodyY + bodyHeight)}
          colors={[palette.body, palette.bodyDark]}
        />
        {isActive && (
          <Shadow dx={0} dy={0} blur={8} color="rgba(255, 255, 255, 0.4)" />
        )}
      </RoundedRect>

      {/* Turret dome */}
      <Circle cx={x} cy={turretY} r={turretRadius} color={palette.turret} />

      {/* Hatch */}
      <Rect
        x={x - 3}
        y={turretY - turretRadius - 1}
        width={6}
        height={3}
        color={palette.accent}
      />

      {/* Barrel */}
      <Line
        p1={vec(x, turretY)}
        p2={vec(barrelEndX, barrelEndY)}
        color={palette.turret}
        style="stroke"
        strokeWidth={barrelWidth}
        strokeCap="round"
      />
    </Group>
  );
};
