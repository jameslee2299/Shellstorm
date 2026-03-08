import { create } from 'zustand';
import type { GameState, TurnPhase, ProjectileState, ExplosionState, FireAction, PlayerState, TankClassId, DamageNumber } from '../../shared/types';
import { generateTerrain, applyCrater } from '../../shared/terrainGen';
import { getBarrelTip, distance, calculateDamage, reflectVelocity } from '../../shared/physics';
import { TANK_CLASSES } from '../../shared/tankClasses';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  TANK_MAX_HP,
  TANK_BARREL_LENGTH,
  TANK_HEIGHT,
  TANK_MOVE_DISTANCE,
  MAX_WIND,
  DIRECT_HIT_DAMAGE,
  SPLASH_DAMAGE_MAX,
  SPLASH_RADIUS,
  TANK_WIDTH,
  TERRAIN_DAMAGE_RADIUS,
  TURN_TIME_LIMIT,
  GRAVITY,
  JACKAL_SPLIT_COUNT,
  JACKAL_SPLIT_SPREAD,
  AEGIS_WALL_HEIGHT,
  AEGIS_WALL_WIDTH,
  DAMAGE_NUMBER_DURATION,
} from '../../shared/constants';

type Players = [PlayerState, PlayerState];

export interface GameStore extends GameState {
  initGame: (seed?: number, p1Class?: TankClassId, p2Class?: TankClassId) => void;
  setPhase: (phase: TurnPhase) => void;
  setAngle: (playerIndex: number, angle: number) => void;
  moveTank: (playerIndex: number, dx: number) => void;
  endMove: () => void;
  fire: (action: FireAction) => ProjectileState;
  updateProjectile: (dt: number) => boolean;
  resolveHit: (hitX: number, hitY: number, projectile?: ProjectileState) => void;
  switchTurn: () => void;
  setExplosion: (explosion: ExplosionState | null) => void;
  updateTurnTimer: (dt: number) => void;
  applyServerState: (state: GameState) => void;
  getActivePlayer: () => PlayerState;
  getTankY: (playerIndex: number) => number;
  aimPower: number;
  setAimPower: (power: number) => void;
  isAltFire: boolean;
  setAltFire: (alt: boolean) => void;
}

function clonePlayers(players: Players): Players {
  return [{ ...players[0] }, { ...players[1] }];
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'WAITING',
  activePlayerIndex: 0,
  players: [
    { id: 'p1', name: 'Player 1', tankX: 0, hp: TANK_MAX_HP, angle: Math.PI / 4, color: '#4FC3F7', moveDistanceLeft: TANK_MOVE_DISTANCE, tankClass: 'soldier' as TankClassId },
    { id: 'p2', name: 'Player 2', tankX: 0, hp: TANK_MAX_HP, angle: (3 * Math.PI) / 4, color: '#EF5350', moveDistanceLeft: TANK_MOVE_DISTANCE, tankClass: 'soldier' as TankClassId },
  ] as Players,
  terrain: [],
  terrainSeed: 0,
  wind: 0,
  projectile: null,
  explosion: null,
  turnTimeLeft: TURN_TIME_LIMIT,
  winner: null,
  subProjectiles: [],
  damageNumbers: [],
  turnAnnouncement: null,
  screenShake: 0,

  initGame: (seed?: number, p1Class: TankClassId = 'soldier', p2Class: TankClassId = 'soldier') => {
    const terrainSeed = seed ?? Math.floor(Math.random() * 1000000);
    const terrain = generateTerrain(terrainSeed);
    const wind = (Math.random() - 0.5) * 2 * MAX_WIND;
    const c1 = TANK_CLASSES[p1Class];
    const c2 = TANK_CLASSES[p2Class];

    set({
      phase: 'MOVE',
      activePlayerIndex: 0,
      players: [
        { id: 'p1', name: 'Player 1', tankX: WORLD_WIDTH * 0.15, hp: c1.maxHp, angle: Math.PI / 4, color: c1.color, moveDistanceLeft: c1.moveDistance, tankClass: p1Class },
        { id: 'p2', name: 'Player 2', tankX: WORLD_WIDTH * 0.85, hp: c2.maxHp, angle: (3 * Math.PI) / 4, color: c2.color, moveDistanceLeft: c2.moveDistance, tankClass: p2Class },
      ] as Players,
      terrain,
      terrainSeed,
      wind,
      projectile: null,
      explosion: null,
      turnTimeLeft: TURN_TIME_LIMIT,
      winner: null,
      subProjectiles: [],
      damageNumbers: [],
      turnAnnouncement: { playerName: 'Player 1', playerColor: c1.color, age: 0 },
      screenShake: 0,
      isAltFire: false,
    });
  },

  setPhase: (phase) => set({ phase }),

  setAngle: (playerIndex, angle) => {
    const players = clonePlayers(get().players);
    players[playerIndex] = { ...players[playerIndex], angle };
    set({ players });
  },

  moveTank: (playerIndex, dx) => {
    const state = get();
    const players = clonePlayers(state.players);
    const player = players[playerIndex];
    const classDef = TANK_CLASSES[player.tankClass];

    if (Math.abs(dx) > player.moveDistanceLeft) return;

    const halfW = classDef.bodyWidth / 2;
    const newX = Math.max(halfW, Math.min(WORLD_WIDTH - halfW, player.tankX + dx));
    players[playerIndex] = {
      ...player,
      tankX: newX,
      moveDistanceLeft: player.moveDistanceLeft - Math.abs(newX - player.tankX),
    };
    set({ players });
  },

  endMove: () => {
    set({ phase: 'AIM' });
  },

  fire: (action) => {
    const state = get();
    const player = state.players[state.activePlayerIndex];
    const classDef = TANK_CLASSES[player.tankClass];
    const groundY = get().getTankY(state.activePlayerIndex);
    const turretY = groundY - classDef.bodyHeight;
    const tip = getBarrelTip(player.tankX, turretY, action.angle, classDef.barrelLength);

    const projectile: ProjectileState = {
      x: tip.x,
      y: tip.y,
      vx: Math.cos(action.angle) * action.power,
      vy: -Math.sin(action.angle) * action.power,
      active: true,
      trail: [{ x: tip.x, y: tip.y }],
      ownerClass: player.tankClass,
      hasBounced: false,
      splitSpawned: false,
      isAltFire: state.isAltFire,
    };

    set({ projectile, phase: 'FIRING', subProjectiles: [] });
    return projectile;
  },

  updateProjectile: (dt) => {
    const state = get();
    if (!state.projectile || !state.projectile.active) return false;

    const p = state.projectile;
    const newVx = p.vx + state.wind * dt;
    const newVy = p.vy + GRAVITY * dt;
    const newX = p.x + newVx * dt;
    const newY = p.y + newVy * dt;

    // Jackal split at apex: when vy transitions from negative (going up) to positive (going down)
    if (p.ownerClass === 'jackal' && !p.splitSpawned && !p.isSubProjectile && p.vy < 0 && newVy >= 0) {
      const speed = Math.sqrt(newVx * newVx + newVy * newVy) * 0.7;
      const baseAngle = Math.atan2(-newVy, newVx);
      const subs: ProjectileState[] = [];
      for (let i = 0; i < JACKAL_SPLIT_COUNT; i++) {
        const spreadAngle = baseAngle + (i - 1) * JACKAL_SPLIT_SPREAD;
        subs.push({
          x: newX,
          y: newY,
          vx: Math.cos(spreadAngle) * speed,
          vy: -Math.sin(spreadAngle) * speed,
          active: true,
          trail: [{ x: newX, y: newY }],
          ownerClass: 'jackal',
          isSubProjectile: true,
          splitSpawned: true,
        });
      }
      set({
        projectile: { ...p, active: false, splitSpawned: true },
        subProjectiles: subs,
      });
      return true; // Sub-projectiles still flying
    }

    // Out of bounds
    if (newX < -50 || newX > WORLD_WIDTH + 50 || newY > WORLD_HEIGHT + 50) {
      set({ projectile: { ...p, active: false } });
      return false;
    }

    // Terrain collision
    if (newX >= 0 && newX < WORLD_WIDTH) {
      const idx = Math.floor((newX / WORLD_WIDTH) * state.terrain.length);
      const ci = Math.max(0, Math.min(state.terrain.length - 1, idx));
      const terrainY = WORLD_HEIGHT - state.terrain[ci];

      if (newY >= terrainY - 4) {
        // Trickshot bounce
        if (p.ownerClass === 'trickshot' && !p.hasBounced) {
          const reflected = reflectVelocity(newVx, newVy, state.terrain, newX, WORLD_WIDTH, 0.8);
          const trail = [...p.trail, { x: newX, y: terrainY }];
          if (trail.length > 30) trail.shift();
          set({
            projectile: { ...p, x: newX, y: terrainY - 5, vx: reflected.vx, vy: reflected.vy, trail, active: true, hasBounced: true },
          });
          return true;
        }

        set({ projectile: { ...p, x: newX, y: terrainY, active: false } });
        return false;
      }
    }

    // Tank collision (check against tank body center, not ground)
    for (let i = 0; i < 2; i++) {
      if (i === state.activePlayerIndex && !p.isSubProjectile) continue;
      const tank = state.players[i];
      const tankClassDef = TANK_CLASSES[tank.tankClass];
      const tankBodyY = get().getTankY(i) - tankClassDef.bodyHeight / 2;
      const dx = newX - tank.tankX;
      const dy = newY - tankBodyY;
      if (Math.abs(dx) < tankClassDef.bodyWidth / 2 + 4 && Math.abs(dy) < tankClassDef.bodyHeight / 2 + 4) {
        set({ projectile: { ...p, x: newX, y: newY, active: false } });
        return false;
      }
    }

    // Update trail
    const trail = [...p.trail, { x: newX, y: newY }];
    if (trail.length > 30) trail.shift();

    set({
      projectile: { ...p, x: newX, y: newY, vx: newVx, vy: newVy, trail, active: true },
    });
    return true;
  },

  resolveHit: (hitX, hitY, proj) => {
    const state = get();
    const activePlayer = state.players[state.activePlayerIndex];
    const classDef = TANK_CLASSES[proj?.ownerClass ?? activePlayer.tankClass];

    // Aegis alt-fire: build terrain wall instead of damage
    if (proj?.isAltFire && proj?.ownerClass === 'aegis') {
      const terrain = [...state.terrain];
      const centerIdx = Math.floor((hitX / WORLD_WIDTH) * terrain.length);
      const halfWidth = Math.floor((AEGIS_WALL_WIDTH / WORLD_WIDTH) * terrain.length / 2);
      for (let i = centerIdx - halfWidth; i <= centerIdx + halfWidth; i++) {
        if (i >= 0 && i < terrain.length) {
          const dist = Math.abs(i - centerIdx) / halfWidth;
          const addHeight = AEGIS_WALL_HEIGHT * (1 - dist * dist); // parabolic
          terrain[i] = Math.min(terrain[i] + addHeight, WORLD_HEIGHT - 20);
        }
      }
      set({
        terrain,
        phase: 'RESOLVING',
        screenShake: 4,
      });
      return;
    }

    const players = clonePlayers(state.players);
    const isSubProjectile = proj?.isSubProjectile;
    const subMultiplier = isSubProjectile ? 0.7 : 1;

    const newDamageNumbers: DamageNumber[] = [];

    for (let i = 0; i < 2; i++) {
      const tankY = get().getTankY(i);
      const tankClassDef = TANK_CLASSES[players[i].tankClass];
      const dist = distance({ x: hitX, y: hitY }, { x: players[i].tankX, y: tankY });
      const directDmg = DIRECT_HIT_DAMAGE * classDef.directHitDamageMultiplier * subMultiplier;
      const splashDmg = SPLASH_DAMAGE_MAX * subMultiplier;
      const splashR = SPLASH_RADIUS * classDef.splashRadiusMultiplier;
      const dmg = calculateDamage(dist, directDmg, splashDmg, splashR, tankClassDef.bodyWidth / 2);
      if (dmg > 0) {
        players[i] = { ...players[i], hp: Math.max(0, players[i].hp - dmg) };
        newDamageNumbers.push({
          x: players[i].tankX,
          y: tankY - tankClassDef.bodyHeight - 20,
          damage: Math.round(dmg),
          age: 0,
          maxAge: DAMAGE_NUMBER_DURATION,
          color: i === state.activePlayerIndex ? '#FF6F00' : '#F44336',
        });
      }
    }

    const terrainRadius = TERRAIN_DAMAGE_RADIUS * classDef.terrainDamageMultiplier * subMultiplier;
    const newTerrain = applyCrater(state.terrain, hitX, terrainRadius, WORLD_WIDTH);

    let winner: number | null = null;
    if (players[0].hp <= 0) winner = 1;
    if (players[1].hp <= 0) winner = 0;

    set({
      players,
      terrain: newTerrain,
      phase: winner !== null ? 'GAME_OVER' : 'RESOLVING',
      winner,
      damageNumbers: [...state.damageNumbers, ...newDamageNumbers],
      screenShake: 8,
    });
  },

  switchTurn: () => {
    const state = get();
    const next = state.activePlayerIndex === 0 ? 1 : 0;
    const newWind = state.wind + (Math.random() - 0.5) * 160;
    const clampedWind = Math.max(-MAX_WIND, Math.min(MAX_WIND, newWind));

    const players = clonePlayers(state.players);
    const nextClassDef = TANK_CLASSES[players[next].tankClass];
    players[next] = { ...players[next], moveDistanceLeft: nextClassDef.moveDistance };

    set({
      activePlayerIndex: next,
      wind: clampedWind,
      projectile: null,
      explosion: null,
      phase: 'MOVE',
      turnTimeLeft: TURN_TIME_LIMIT,
      players,
      subProjectiles: [],
      turnAnnouncement: { playerName: players[next].name, playerColor: players[next].color, age: 0 },
      isAltFire: false,
    });
  },

  setExplosion: (explosion) => set({ explosion }),

  updateTurnTimer: (dt) => {
    const state = get();
    if (state.phase !== 'MOVE' && state.phase !== 'AIM') return;
    const newTime = state.turnTimeLeft - dt;
    if (newTime <= 0) {
      set({ turnTimeLeft: 0 });
      get().switchTurn();
    } else {
      set({ turnTimeLeft: newTime });
    }
  },

  applyServerState: (serverState) => set(serverState),

  getActivePlayer: () => get().players[get().activePlayerIndex],

  getTankY: (playerIndex) => {
    const state = get();
    const tank = state.players[playerIndex];
    if (state.terrain.length === 0) return WORLD_HEIGHT;
    const idx = Math.floor((tank.tankX / WORLD_WIDTH) * state.terrain.length);
    const ci = Math.max(0, Math.min(state.terrain.length - 1, idx));
    return WORLD_HEIGHT - state.terrain[ci];
  },

  aimPower: 0,
  setAimPower: (power) => set({ aimPower: power }),

  isAltFire: false,
  setAltFire: (alt) => set({ isAltFire: alt }),
}));
