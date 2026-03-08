import { useEffect, useRef } from 'react';
import { useGameStore } from './GameState';
import { EXPLOSION_DURATION, PARTICLE_COUNT, EXPLOSION_RADIUS } from './constants';
import { TANK_CLASSES } from '../../shared/tankClasses';
import { TURN_ANNOUNCEMENT_DURATION, GRAVITY } from '../../shared/constants';
import type { ExplosionState, ParticleState, ProjectileState } from '../../shared/types';

function createExplosion(x: number, y: number, radiusMultiplier: number = 1): ExplosionState {
  const particles: ParticleState[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    const speed = 50 + Math.random() * 150;
    const colors = ['255,111,0', '255,213,79', '255,152,0', '244,67,54', '255,255,255'];
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      radius: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      maxLife: 0.4 + Math.random() * 0.4,
    });
  }

  return {
    x,
    y,
    radius: 0,
    maxRadius: EXPLOSION_RADIUS * radiusMultiplier,
    progress: 0,
    particles,
  };
}

function updateSubProjectile(p: ProjectileState, dt: number, wind: number, terrain: number[], worldWidth: number, worldHeight: number): ProjectileState | null {
  if (!p.active) return null;
  const newVx = p.vx + wind * dt;
  const newVy = p.vy + GRAVITY * dt;
  const newX = p.x + newVx * dt;
  const newY = p.y + newVy * dt;

  if (newX < -50 || newX > worldWidth + 50 || newY > worldHeight + 50) {
    return { ...p, active: false };
  }

  if (newX >= 0 && newX < worldWidth) {
    const idx = Math.floor((newX / worldWidth) * terrain.length);
    const ci = Math.max(0, Math.min(terrain.length - 1, idx));
    const terrainY = worldHeight - terrain[ci];
    if (newY >= terrainY - 4) {
      return { ...p, x: newX, y: terrainY, active: false };
    }
  }

  const trail = [...p.trail, { x: newX, y: newY }];
  if (trail.length > 20) trail.shift();

  return { ...p, x: newX, y: newY, vx: newVx, vy: newVy, trail, active: true };
}

export function useGameLoop() {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const explosionTimerRef = useRef<number>(0);
  const switchTimerRef = useRef<number>(0);
  const subExplosionQueue = useRef<{ x: number; y: number; proj: ProjectileState }[]>([]);
  const subExplosionTimer = useRef<number>(0);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const dt =
        lastTimeRef.current === 0
          ? 1 / 60
          : Math.min((timestamp - lastTimeRef.current) / 1000, 1 / 30);
      lastTimeRef.current = timestamp;

      const store = useGameStore.getState();
      const { phase, projectile, explosion } = store;

      // Turn timer
      if (phase === 'MOVE' || phase === 'AIM') {
        store.updateTurnTimer(dt);
      }

      // Screen shake decay
      if (store.screenShake > 0) {
        const newShake = store.screenShake * 0.85;
        useGameStore.setState({ screenShake: newShake < 0.5 ? 0 : newShake });
      }

      // Damage number aging
      if (store.damageNumbers.length > 0) {
        const updated = store.damageNumbers
          .map(dn => ({ ...dn, age: dn.age + dt }))
          .filter(dn => dn.age < dn.maxAge);
        useGameStore.setState({ damageNumbers: updated });
      }

      // Turn announcement aging
      if (store.turnAnnouncement) {
        const newAge = store.turnAnnouncement.age + dt;
        if (newAge >= TURN_ANNOUNCEMENT_DURATION) {
          useGameStore.setState({ turnAnnouncement: null });
        } else {
          useGameStore.setState({
            turnAnnouncement: { ...store.turnAnnouncement, age: newAge },
          });
        }
      }

      // Projectile flight
      if (phase === 'FIRING') {
        let mainStillFlying = false;

        if (projectile?.active) {
          mainStillFlying = store.updateProjectile(dt);
          if (!mainStillFlying) {
            const p = useGameStore.getState().projectile;
            if (p && !p.splitSpawned) {
              // Normal impact — not a jackal split
              const ownerClass = p.ownerClass ?? 'soldier';
              const classDef = TANK_CLASSES[ownerClass];
              const isAltFire = p.isAltFire;

              if (isAltFire && ownerClass === 'aegis') {
                // Aegis wall — no explosion
                useGameStore.getState().resolveHit(p.x, p.y, p);
                explosionTimerRef.current = 0;
              } else {
                const exp = createExplosion(p.x, p.y, classDef.explosionRadiusMultiplier);
                useGameStore.getState().setExplosion(exp);
                useGameStore.getState().resolveHit(p.x, p.y, p);
                explosionTimerRef.current = 0;
              }
            }
          }
        }

        // Update sub-projectiles (Jackal split)
        const currentState = useGameStore.getState();
        if (currentState.subProjectiles.length > 0) {
          const updatedSubs: ProjectileState[] = [];
          let anyActive = false;

          for (const sub of currentState.subProjectiles) {
            if (!sub.active) {
              updatedSubs.push(sub);
              continue;
            }
            const updated = updateSubProjectile(sub, dt, currentState.wind, currentState.terrain, 800, 500);
            if (updated) {
              updatedSubs.push(updated);
              if (updated.active) {
                anyActive = true;
              } else {
                // Sub-projectile landed — queue explosion
                subExplosionQueue.current.push({ x: updated.x, y: updated.y, proj: updated });
              }
            }
          }

          useGameStore.setState({ subProjectiles: updatedSubs });

          // Process queued sub-explosions
          if (subExplosionQueue.current.length > 0 && !anyActive) {
            for (const { x, y, proj } of subExplosionQueue.current) {
              const classDef = TANK_CLASSES[proj.ownerClass ?? 'jackal'];
              const exp = createExplosion(x, y, classDef.explosionRadiusMultiplier);
              useGameStore.getState().setExplosion(exp);
              useGameStore.getState().resolveHit(x, y, proj);
            }
            subExplosionQueue.current = [];
            explosionTimerRef.current = 0;
          }

          if (anyActive) {
            mainStillFlying = true;
          }
        }

        // If nothing is flying and no split just happened, check if we need to proceed
        if (!mainStillFlying && currentState.subProjectiles.length === 0 && projectile && !projectile.active && projectile.splitSpawned) {
          // Jackal main deactivated but subs haven't been created yet — wait
        }
      }

      // Explosion animation
      const currentPhase = useGameStore.getState().phase;
      const currentExplosion = useGameStore.getState().explosion;
      if (
        currentExplosion &&
        (currentPhase === 'RESOLVING' || currentPhase === 'GAME_OVER')
      ) {
        explosionTimerRef.current += dt;
        const progress = Math.min(
          1,
          explosionTimerRef.current / EXPLOSION_DURATION
        );

        const particles = currentExplosion.particles.map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt + 200 * dt * dt,
          vy: p.vy + 200 * dt,
          life: Math.max(0, 1 - explosionTimerRef.current / p.maxLife),
        }));

        useGameStore.getState().setExplosion({
          ...currentExplosion,
          radius: currentExplosion.maxRadius * Math.min(1, progress * 2),
          progress,
          particles,
        });

        if (progress >= 1) {
          if (useGameStore.getState().phase === 'GAME_OVER') {
            // Game over — keep explosion
          } else {
            switchTimerRef.current = 0;
            useGameStore.getState().setPhase('SWITCHING');
          }
        }
      }

      // Switching delay
      if (currentPhase === 'SWITCHING') {
        switchTimerRef.current += dt;
        if (switchTimerRef.current > 0.5) {
          useGameStore.getState().switchTurn();
          switchTimerRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
}
