import type { ParticleState } from '../../../shared/types';

export function createParticle(
  x: number,
  y: number,
  angle: number,
  speed: number,
  color: string,
  radius: number = 3,
  maxLife: number = 0.5
): ParticleState {
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    color,
    life: 1,
    maxLife,
  };
}

export function updateParticle(
  particle: ParticleState,
  dt: number,
  gravity: number = 200
): ParticleState {
  return {
    ...particle,
    x: particle.x + particle.vx * dt,
    y: particle.y + particle.vy * dt,
    vy: particle.vy + gravity * dt,
    life: Math.max(0, particle.life - dt / particle.maxLife),
  };
}

export function isParticleAlive(particle: ParticleState): boolean {
  return particle.life > 0;
}
