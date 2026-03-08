import type { ExplosionState, ParticleState } from '../../../shared/types';
import { EXPLOSION_RADIUS, PARTICLE_COUNT } from '../constants';

const PARTICLE_COLORS = ['255,111,0', '255,213,79', '255,152,0', '244,67,54', '255,255,255'];

export function createExplosion(x: number, y: number): ExplosionState {
  const particles: ParticleState[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    const speed = 50 + Math.random() * 150;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      radius: 2 + Math.random() * 4,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      life: 1,
      maxLife: 0.4 + Math.random() * 0.4,
    });
  }

  return {
    x,
    y,
    radius: 0,
    maxRadius: EXPLOSION_RADIUS,
    progress: 0,
    particles,
  };
}

export function updateExplosion(
  explosion: ExplosionState,
  dt: number,
  elapsed: number
): ExplosionState {
  const particles = explosion.particles.map((p) => ({
    ...p,
    x: p.x + p.vx * dt,
    y: p.y + p.vy * dt + 200 * dt * dt,
    vy: p.vy + 200 * dt,
    life: Math.max(0, 1 - elapsed / p.maxLife),
  }));

  const progress = Math.min(1, elapsed / 0.6);

  return {
    ...explosion,
    radius: explosion.maxRadius * Math.min(1, progress * 2),
    progress,
    particles,
  };
}
