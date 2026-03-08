import { GRAVITY, PROJECTILE_RADIUS } from './constants';
import type { Position } from './types';

/**
 * Compute projectile position at time t given initial conditions and wind.
 * Uses standard kinematic equations with constant gravity and wind acceleration.
 */
export function projectilePosition(
  startX: number,
  startY: number,
  angle: number,
  power: number,
  wind: number,
  t: number
): Position {
  const vx = Math.cos(angle) * power;
  const vy = -Math.sin(angle) * power; // negative because Y increases downward

  return {
    x: startX + vx * t + 0.5 * wind * t * t,
    y: startY + vy * t + 0.5 * GRAVITY * t * t,
  };
}

/**
 * Compute the full trajectory as a series of points.
 * Stops when projectile goes below maxY or outside x bounds.
 */
export function computeTrajectory(
  startX: number,
  startY: number,
  angle: number,
  power: number,
  wind: number,
  terrain: number[],
  worldWidth: number,
  worldHeight: number,
  dt: number = 1 / 60
): { points: Position[]; hitPosition: Position | null } {
  const points: Position[] = [];
  let t = 0;
  const maxT = 20; // safety limit

  while (t < maxT) {
    const pos = projectilePosition(startX, startY, angle, power, wind, t);
    points.push(pos);

    // Out of bounds check
    if (pos.x < -50 || pos.x > worldWidth + 50 || pos.y > worldHeight + 50) {
      return { points, hitPosition: null };
    }

    // Terrain collision check
    if (pos.x >= 0 && pos.x < worldWidth) {
      const terrainIndex = Math.floor((pos.x / worldWidth) * terrain.length);
      const clampedIndex = Math.max(0, Math.min(terrain.length - 1, terrainIndex));
      const terrainY = worldHeight - terrain[clampedIndex];

      if (pos.y >= terrainY - PROJECTILE_RADIUS) {
        return { points, hitPosition: { x: pos.x, y: terrainY } };
      }
    }

    t += dt;
  }

  return { points, hitPosition: null };
}

/**
 * Get the barrel tip position for a tank at given x, terrain height, and angle.
 */
export function getBarrelTip(
  tankX: number,
  tankY: number,
  angle: number,
  barrelLength: number
): Position {
  return {
    x: tankX + Math.cos(angle) * barrelLength,
    y: tankY - Math.sin(angle) * barrelLength,
  };
}

/**
 * Calculate distance between two points.
 */
export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Reflect velocity vector across a terrain normal.
 * Used by Trickshot bounce ability.
 */
export function reflectVelocity(
  vx: number,
  vy: number,
  terrain: number[],
  hitX: number,
  worldWidth: number,
  energyLoss: number = 0.8
): { vx: number; vy: number } {
  // Compute terrain slope from adjacent heightmap points
  const idx = Math.floor((hitX / worldWidth) * terrain.length);
  const i0 = Math.max(0, idx - 2);
  const i1 = Math.min(terrain.length - 1, idx + 2);
  const dh = terrain[i1] - terrain[i0];
  const dx = ((i1 - i0) / terrain.length) * worldWidth;

  // Terrain normal (pointing "up" from surface)
  // Terrain height increases upward, but screen Y is inverted
  const slopeAngle = Math.atan2(dh, dx);
  const nx = -Math.sin(slopeAngle);
  const ny = -Math.cos(slopeAngle);

  // Reflect: v' = v - 2(v·n)n
  const dot = vx * nx + vy * ny;
  const rvx = (vx - 2 * dot * nx) * energyLoss;
  const rvy = (vy - 2 * dot * ny) * energyLoss;

  return { vx: rvx, vy: rvy };
}

/**
 * Calculate damage based on distance from explosion center.
 */
export function calculateDamage(
  dist: number,
  directHitDamage: number,
  splashDamageMax: number,
  splashRadius: number,
  directHitRadius: number
): number {
  if (dist <= directHitRadius) {
    return directHitDamage;
  }
  if (dist <= splashRadius) {
    const falloff = 1 - (dist - directHitRadius) / (splashRadius - directHitRadius);
    return Math.round(splashDamageMax * falloff);
  }
  return 0;
}
