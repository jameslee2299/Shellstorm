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

const palette = TANK_PALETTES.trickshot;

const bodyWidth = 40;
const bodyHeight = 20;
const barrelLength = 26;
const barrelWidth = 5;
const turretRadius = 9;

export const TrickshotTank: React.FC<TankComponentProps> = ({
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
  const hpBarWidth = 50;
  const hpBarHeight = 4;
  const hpBarX = x - hpBarWidth / 2;
  const hpBarY = y - bodyHeight - 18;
  const hpColor = hpRatio > 0.3 ? '#22C55E' : '#EF4444';

  const tipX = x + Math.cos(angle) * barrelLength;
  const tipY = turretY - Math.sin(angle) * barrelLength;

  const wheelY = y - 3;
  const wheelRadius = 4;
  const wheelXPositions = [x - 14, x - 5, x + 5, x + 14];

  // Diamond suit path on body side
  const diamondCenterX = x + 8;
  const diamondCenterY = y - bodyHeight / 2;
  const diamondPath = Skia.Path.Make();
  diamondPath.moveTo(diamondCenterX, diamondCenterY - 4); // top
  diamondPath.lineTo(diamondCenterX + 2.5, diamondCenterY); // right
  diamondPath.lineTo(diamondCenterX, diamondCenterY + 4); // bottom
  diamondPath.lineTo(diamondCenterX - 2.5, diamondCenterY); // left
  diamondPath.close();

  // Curved arc above turret
  const arcPath = Skia.Path.Make();
  const arcStartX = x - 8;
  const arcEndX = x + 8;
  const arcY = turretY - turretRadius - 2;
  arcPath.moveTo(arcStartX, arcY);
  arcPath.quadTo(x, arcY - 4, arcEndX, arcY);

  // V-shaped deflector at barrel tip
  // Two lines from tip extending backwards and outward at +/-30 degrees from barrel direction
  const deflectorLength = 6;
  // Barrel direction angle (from turret center to tip)
  const barrelAngle = angle;
  // Deflector lines go backwards (opposite to barrel direction) and spread at +/-30 degrees
  const backAngle = Math.PI + barrelAngle; // reverse direction
  const spreadAngle = (30 * Math.PI) / 180;

  const deflector1EndX =
    tipX + Math.cos(backAngle + spreadAngle) * deflectorLength;
  const deflector1EndY =
    tipY - Math.sin(backAngle + spreadAngle) * deflectorLength;
  const deflector2EndX =
    tipX + Math.cos(backAngle - spreadAngle) * deflectorLength;
  const deflector2EndY =
    tipY - Math.sin(backAngle - spreadAngle) * deflectorLength;

  return (
    <Group>
      {/* 1. HP Bar background */}
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

      {/* 2. Track strip */}
      <RoundedRect
        x={bodyX - 2}
        y={y - 5}
        width={bodyWidth + 4}
        height={7}
        r={3}
        color={palette.track}
      />

      {/* 3. Wheels */}
      {wheelXPositions.map((wx, i) => (
        <Circle
          key={i}
          cx={wx}
          cy={wheelY}
          r={wheelRadius}
          color={palette.track}
        />
      ))}

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

      {/* 5. Diamond suit on body side */}
      <Path path={diamondPath} color={palette.accent} style="fill" />

      {/* 6. Turret */}
      <Circle cx={x} cy={turretY} r={turretRadius} color={palette.turret} />

      {/* 7. Curved arc above turret */}
      <Path
        path={arcPath}
        color={palette.accent}
        style="stroke"
        strokeWidth={2}
      />

      {/* 8. Barrel */}
      <Line
        p1={vec(x, turretY)}
        p2={vec(tipX, tipY)}
        color={palette.barrel}
        style="stroke"
        strokeWidth={barrelWidth}
        strokeCap="round"
      />

      {/* 9. V-shaped deflector at barrel tip */}
      <Line
        p1={vec(tipX, tipY)}
        p2={vec(deflector1EndX, deflector1EndY)}
        color={palette.accent}
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
      />
      <Line
        p1={vec(tipX, tipY)}
        p2={vec(deflector2EndX, deflector2EndY)}
        color={palette.accent}
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
      />
    </Group>
  );
};
