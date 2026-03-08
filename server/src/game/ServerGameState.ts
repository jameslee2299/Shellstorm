import { generateTerrain, applyCrater } from '../../../shared/terrainGen';
import type { GameState, PlayerState, TurnPhase, TankClassId } from '../../../shared/types';
import { TANK_CLASSES } from '../../../shared/tankClasses';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  TANK_MOVE_DISTANCE,
  TANK_WIDTH,
  MAX_WIND,
  TERRAIN_DAMAGE_RADIUS,
  TURN_TIME_LIMIT,
  AEGIS_WALL_HEIGHT,
  AEGIS_WALL_WIDTH,
} from '../../../shared/constants';

export class ServerGameState {
  phase: TurnPhase = 'WAITING';
  activePlayerIndex: number = 0;
  players: [PlayerState, PlayerState];
  terrain: number[] = [];
  terrainSeed: number = 0;
  wind: number = 0;
  turnTimeLeft: number = TURN_TIME_LIMIT;
  winner: number | null = null;

  constructor(name1: string, name2: string, p1Class: TankClassId = 'soldier', p2Class: TankClassId = 'soldier') {
    const c1 = TANK_CLASSES[p1Class];
    const c2 = TANK_CLASSES[p2Class];
    this.players = [
      {
        id: 'p1',
        name: name1,
        tankX: WORLD_WIDTH * 0.15,
        hp: c1.maxHp,
        angle: Math.PI / 4,
        color: c1.color,
        moveDistanceLeft: c1.moveDistance,
        tankClass: p1Class,
      },
      {
        id: 'p2',
        name: name2,
        tankX: WORLD_WIDTH * 0.85,
        hp: c2.maxHp,
        angle: (3 * Math.PI) / 4,
        color: c2.color,
        moveDistanceLeft: c2.moveDistance,
        tankClass: p2Class,
      },
    ];
  }

  init(): void {
    this.terrainSeed = Math.floor(Math.random() * 1000000);
    this.terrain = generateTerrain(this.terrainSeed);
    this.wind = (Math.random() - 0.5) * 2 * MAX_WIND;
    this.phase = 'MOVE';
    this.activePlayerIndex = 0;
    this.players[0].tankX = WORLD_WIDTH * 0.15;
    this.players[1].tankX = WORLD_WIDTH * 0.85;
    const c1 = TANK_CLASSES[this.players[0].tankClass];
    const c2 = TANK_CLASSES[this.players[1].tankClass];
    this.players[0].hp = c1.maxHp;
    this.players[1].hp = c2.maxHp;
    this.players[0].moveDistanceLeft = c1.moveDistance;
    this.players[1].moveDistanceLeft = c2.moveDistance;
    this.winner = null;
  }

  moveTank(playerIndex: number, dx: number): void {
    const player = this.players[playerIndex];
    const classDef = TANK_CLASSES[player.tankClass];
    const absDx = Math.abs(dx);
    if (absDx > player.moveDistanceLeft) return;

    const halfW = classDef.bodyWidth / 2;
    const newX = Math.max(halfW, Math.min(WORLD_WIDTH - halfW, player.tankX + dx));
    player.moveDistanceLeft -= Math.abs(newX - player.tankX);
    player.tankX = newX;
  }

  getTankY(playerIndex: number): number {
    const tank = this.players[playerIndex];
    const idx = Math.floor((tank.tankX / WORLD_WIDTH) * this.terrain.length);
    const ci = Math.max(0, Math.min(this.terrain.length - 1, idx));
    return WORLD_HEIGHT - this.terrain[ci];
  }

  applyExplosion(hitX: number, ownerClass?: TankClassId): void {
    const classDef = ownerClass ? TANK_CLASSES[ownerClass] : TANK_CLASSES.soldier;
    const radius = TERRAIN_DAMAGE_RADIUS * classDef.terrainDamageMultiplier;
    this.terrain = applyCrater(this.terrain, hitX, radius, WORLD_WIDTH);
  }

  applyWall(hitX: number): void {
    const centerIdx = Math.floor((hitX / WORLD_WIDTH) * this.terrain.length);
    const halfWidth = Math.floor((AEGIS_WALL_WIDTH / WORLD_WIDTH) * this.terrain.length / 2);
    for (let i = centerIdx - halfWidth; i <= centerIdx + halfWidth; i++) {
      if (i >= 0 && i < this.terrain.length) {
        const dist = Math.abs(i - centerIdx) / halfWidth;
        const addHeight = AEGIS_WALL_HEIGHT * (1 - dist * dist);
        this.terrain[i] = Math.min(this.terrain[i] + addHeight, WORLD_HEIGHT - 20);
      }
    }
  }

  switchTurn(): void {
    this.activePlayerIndex = this.activePlayerIndex === 0 ? 1 : 0;
    this.wind = Math.max(
      -MAX_WIND,
      Math.min(MAX_WIND, this.wind + (Math.random() - 0.5) * 160)
    );
    const nextClassDef = TANK_CLASSES[this.players[this.activePlayerIndex].tankClass];
    this.players[this.activePlayerIndex].moveDistanceLeft = nextClassDef.moveDistance;
    this.phase = 'MOVE';
    this.turnTimeLeft = TURN_TIME_LIMIT;
  }

  getClientState(): GameState {
    return {
      phase: this.phase,
      activePlayerIndex: this.activePlayerIndex,
      players: [{ ...this.players[0] }, { ...this.players[1] }],
      terrain: this.terrain,
      terrainSeed: this.terrainSeed,
      wind: this.wind,
      projectile: null,
      explosion: null,
      turnTimeLeft: this.turnTimeLeft,
      winner: this.winner,
      subProjectiles: [],
      damageNumbers: [],
      turnAnnouncement: null,
      screenShake: 0,
    };
  }
}
