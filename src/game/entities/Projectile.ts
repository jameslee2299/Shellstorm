import type { ProjectileState, Position } from '../../../shared/types';

export function createProjectile(
  x: number,
  y: number,
  angle: number,
  power: number
): ProjectileState {
  return {
    x,
    y,
    vx: Math.cos(angle) * power,
    vy: -Math.sin(angle) * power,
    active: true,
    trail: [{ x, y }],
  };
}

export function updateTrail(
  trail: Position[],
  x: number,
  y: number,
  maxLength: number
): Position[] {
  const newTrail = [...trail, { x, y }];
  if (newTrail.length > maxLength) newTrail.shift();
  return newTrail;
}
