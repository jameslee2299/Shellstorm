import React from 'react';
import {
  Group,
  RoundedRect,
  Rect,
  Circle,
  Line,
  vec,
  Shadow,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import { TankComponentProps, TANK_PALETTES } from './tankColors';

const palette = TANK_PALETTES.bertha;

const bodyWidth = 50;
const bodyHeight = 24;
const barrelLength = 32;
const barrelWidth = 9;
const turretRadius = 12;

export const BerthaTank: React.FC<TankComponentProps> = ({
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

  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

  const barrelEndX = x + Math.cos(angle) * barrelLength;
  const barrelEndY = turretY - Math.sin(angle) * barrelLength;

  return (
    <Group>
      {/* 1. HP Bar */}
      <Rect
        x={x - 30}
        y={y - bodyHeight - 18}
        width={60}
        height={4}
        color="#333333"
      />
      <Rect
        x={x - 30}
        y={y - bodyHeight - 18}
        width={60 * hpRatio}
        height={4}
        color={hpRatio > 0.5 ? '#44CC44' : hpRatio > 0.25 ? '#CCCC44' : '#CC4444'}
      />

      {/* 2. Track strip */}
      <RoundedRect
        x={bodyX - 3}
        y={y - 6}
        width={bodyWidth + 6}
        height={8}
        r={3}
        color={palette.track}
      />

      {/* 3. Wheel circles */}
      <Circle cx={x - 20} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x - 10} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x + 10} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x + 20} cy={y - 3} r={4} color="#555555" />

      {/* 4. Armor skirts */}
      <Rect
        x={bodyX - 3}
        y={bodyY + 8}
        width={8}
        height={12}
        color={palette.bodyDark}
      />
      <Rect
        x={bodyX + bodyWidth - 5}
        y={bodyY + 8}
        width={8}
        height={12}
        color={palette.bodyDark}
      />

      {/* 5. Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        r={5}
        color={palette.body}
      >
        {isActive && <Shadow dx={0} dy={0} blur={8} color="white" />}
      </RoundedRect>

      {/* 6. Rivet circles */}
      <Circle cx={bodyX + 10} cy={bodyY + 3} r={1.5} color={palette.bodyDark} />
      <Circle cx={bodyX + 20} cy={bodyY + 3} r={1.5} color={palette.bodyDark} />
      <Circle cx={bodyX + 30} cy={bodyY + 3} r={1.5} color={palette.bodyDark} />
      <Circle cx={bodyX + 40} cy={bodyY + 3} r={1.5} color={palette.bodyDark} />

      {/* 7. Turret */}
      <Circle cx={x} cy={turretY} r={turretRadius} color={palette.turret} />

      {/* 8. Concentric ring */}
      <Circle
        cx={x}
        cy={turretY}
        r={turretRadius - 3}
        color={palette.bodyDark}
        style="stroke"
        strokeWidth={1}
      />

      {/* 9. Fat barrel */}
      <Line
        p1={vec(x, turretY)}
        p2={vec(barrelEndX, barrelEndY)}
        strokeWidth={barrelWidth}
        strokeCap="butt"
        color={palette.barrel}
      />

      {/* 10. Muzzle ring */}
      <Circle cx={barrelEndX} cy={barrelEndY} r={5} color={palette.accent} />
    </Group>
  );
};
