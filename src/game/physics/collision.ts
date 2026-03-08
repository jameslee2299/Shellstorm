import type { Position } from '../../../shared/types';
import { TANK_WIDTH } from '../../../shared/constants';

export function checkTerrainCollision(
  pos: Position,
  terrain: number[],
  worldWidth: number,
  worldHeight: number,
  projectileRadius: number
): boolean {
  if (pos.x < 0 || pos.x >= worldWidth) return false;
  if (terrain.length === 0) return false;

  const idx = Math.floor((pos.x / worldWidth) * terrain.length);
  const ci = Math.max(0, Math.min(terrain.length - 1, idx));
  const terrainY = worldHeight - terrain[ci];

  return pos.y >= terrainY - projectileRadius;
}

export function checkTankCollision(
  pos: Position,
  tankX: number,
  tankY: number
): boolean {
  const dx = Math.abs(pos.x - tankX);
  const dy = Math.abs(pos.y - tankY);
  return dx < TANK_WIDTH / 2 + 4 && dy < 20;
}
