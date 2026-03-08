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

const palette = TANK_PALETTES.aegis;

const bodyWidth = 44;
const bodyHeight = 22;
const barrelLength = 28;
const barrelWidth = 6;
const turretRadius = 10;

// Pre-build the hexagon path for the turret overlay.
// Points are computed at mount time since they are relative offsets;
// we translate the Group at render time to position them.
const hexRadius = 7;
const hexPath = Skia.Path.Make();
for (let i = 0; i < 6; i++) {
  const theta = (Math.PI / 3) * i;
  const px = Math.cos(theta) * hexRadius;
  const py = Math.sin(theta) * hexRadius;
  if (i === 0) {
    hexPath.moveTo(px, py);
  } else {
    hexPath.lineTo(px, py);
  }
}
hexPath.close();

// Pre-build shield panel parallelogram paths (relative to body origin).
// Left panel: slanted rectangle on the left side of the hull.
const leftShieldPath = Skia.Path.Make();
leftShieldPath.moveTo(2 + 2, 4);        // top-left (slanted inward)
leftShieldPath.lineTo(2 + 8, 4);        // top-right
leftShieldPath.lineTo(2 + 6, 4 + 14);   // bottom-right (slanted inward)
leftShieldPath.lineTo(2, 4 + 14);        // bottom-left
leftShieldPath.close();

// Right panel: mirror parallelogram on the right side of the hull.
const rPanelX = bodyWidth - 10;
const rightShieldPath = Skia.Path.Make();
rightShieldPath.moveTo(rPanelX, 4);              // top-left
rightShieldPath.lineTo(rPanelX + 6, 4);          // top-right (slanted inward)
rightShieldPath.lineTo(rPanelX + 8, 4 + 14);     // bottom-right
rightShieldPath.lineTo(rPanelX + 2, 4 + 14);     // bottom-left (slanted inward)
rightShieldPath.close();

export const AegisTank: React.FC<TankComponentProps> = ({
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
  const hpBarWidth = 54;
  const hpBarHeight = 4;
  const hpBarX = x - hpBarWidth / 2;
  const hpBarY = y - bodyHeight - 18;
  const hpColor = hpRatio > 0.5 ? '#44CC44' : hpRatio > 0.25 ? '#CCCC44' : '#CC4444';

  const barrelEndX = x + Math.cos(angle) * barrelLength;
  const barrelEndY = turretY - Math.sin(angle) * barrelLength;

  return (
    <Group>
      {/* 1. HP Bar */}
      <Rect
        x={hpBarX}
        y={hpBarY}
        width={hpBarWidth}
        height={hpBarHeight}
        color="#333333"
      />
      <Rect
        x={hpBarX}
        y={hpBarY}
        width={hpBarWidth * hpRatio}
        height={hpBarHeight}
        color={hpColor}
      />

      {/* 2. Extra-thick track strip */}
      <RoundedRect
        x={bodyX - 3}
        y={y - 6}
        width={bodyWidth + 6}
        height={8}
        r={3}
        color={palette.track}
      />

      {/* 3. Wheels (5 evenly spaced) */}
      <Circle cx={x - 18} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x - 9} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x + 9} cy={y - 3} r={4} color="#555555" />
      <Circle cx={x + 18} cy={y - 3} r={4} color="#555555" />

      {/* 4. Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        r={4}
        color={palette.body}
      >
        {isActive && (
          <Shadow dx={0} dy={0} blur={8} color="rgba(255, 255, 255, 0.4)" />
        )}
      </RoundedRect>

      {/* 5. Dark border armor plating effect (stroke overlay) */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        r={4}
        color={palette.bodyDark}
        style="stroke"
        strokeWidth={2}
      />

      {/* 6. Shield panel parallelograms */}
      <Group transform={[{ translateX: bodyX }, { translateY: bodyY }]}>
        <Path path={leftShieldPath} color={palette.accent} opacity={0.4} />
        <Path path={rightShieldPath} color={palette.accent} opacity={0.4} />
      </Group>

      {/* 7. Turret */}
      <Circle cx={x} cy={turretY} r={turretRadius} color={palette.turret} />

      {/* 8. Hexagonal overlay on turret */}
      <Group transform={[{ translateX: x }, { translateY: turretY }]}>
        <Path
          path={hexPath}
          color={palette.accent}
          style="stroke"
          strokeWidth={1.5}
        />
      </Group>

      {/* 9. Barrel */}
      <Line
        p1={vec(x, turretY)}
        p2={vec(barrelEndX, barrelEndY)}
        color={palette.barrel}
        style="stroke"
        strokeWidth={barrelWidth}
        strokeCap="round"
      />

      {/* 10. Shield generator on top of turret */}
      <RoundedRect
        x={x - 4}
        y={turretY - turretRadius - 3}
        width={8}
        height={5}
        r={1}
        color={palette.accent}
      />
    </Group>
  );
};
