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
import type { TankComponentProps } from './tankColors';
import { TANK_PALETTES } from './tankColors';

const palette = TANK_PALETTES.jackal;

const bodyWidth = 36;
const bodyHeight = 16;
const barrelLength = 24;
const barrelWidth = 4;
const turretRadius = 7;

export const JackalTank: React.FC<TankComponentProps> = ({
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
  const hpBarWidth = 46;
  const hpBarHeight = 4;
  const hpBarX = x - hpBarWidth / 2;
  const hpBarY = y - bodyHeight - 18;
  const hpColor = hpRatio > 0.3 ? '#22C55E' : '#EF4444';

  // Turret is offset forward
  const turretCx = x + 4;
  const barrelEndX = turretCx + Math.cos(angle) * barrelLength;
  const barrelEndY = turretY - Math.sin(angle) * barrelLength;

  // Angular trapezoid body path (wide bottom, narrow top)
  const bodyPath = Skia.Path.Make();
  bodyPath.moveTo(bodyX, y);                          // bottom-left
  bodyPath.lineTo(bodyX + bodyWidth, y);              // bottom-right
  bodyPath.lineTo(bodyX + bodyWidth - 6, bodyY);      // top-right
  bodyPath.lineTo(bodyX + 6, bodyY);                  // top-left
  bodyPath.close();

  // Chevron ">" accent on the body side
  const chevronX = x - 4;
  const chevronY = y - bodyHeight / 2;
  const chevronPath = Skia.Path.Make();
  chevronPath.moveTo(chevronX - 3, chevronY - 4);
  chevronPath.lineTo(chevronX + 3, chevronY);
  chevronPath.lineTo(chevronX - 3, chevronY + 4);

  // Wheel positions
  const wheelY = y - 2;
  const wheelRadius = 3;
  const wheelXPositions = [x - 12, x, x + 12];

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

      {/* Track strip — narrow tracks */}
      <RoundedRect
        x={bodyX - 1}
        y={y - 4}
        width={bodyWidth + 2}
        height={5}
        r={2}
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

      {/* Angular trapezoid body */}
      <Path path={bodyPath} color={palette.body}>
        {isActive && (
          <Shadow dx={0} dy={0} blur={8} color="rgba(255, 255, 255, 0.4)" />
        )}
      </Path>

      {/* Chevron accent on body */}
      <Path
        path={chevronPath}
        color={palette.accent}
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
        strokeJoin="round"
      />

      {/* Small turret (offset forward) */}
      <Circle cx={turretCx} cy={turretY} r={turretRadius} color={palette.turret} />

      {/* Thin barrel */}
      <Line
        p1={vec(turretCx, turretY)}
        p2={vec(barrelEndX, barrelEndY)}
        color={palette.barrel}
        style="stroke"
        strokeWidth={barrelWidth}
        strokeCap="round"
      />
    </Group>
  );
};
