import { getBarrelTip } from '../../../shared/physics';
import { TANK_CLASSES } from '../../../shared/tankClasses';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PROJECTILE_RADIUS,
  GRAVITY,
} from '../../../shared/constants';
import { ServerGameState } from './ServerGameState';
import type { Position } from '../../../shared/types';

interface ShotResult {
  trajectory: Position[];
  hitPosition: Position | null;
  hitPlayerIndex: number | null;
}

export class PhysicsEngine {
  computeShot(
    gameState: ServerGameState,
    playerIndex: number,
    angle: number,
    power: number
  ): ShotResult {
    const player = gameState.players[playerIndex];
    const classDef = TANK_CLASSES[player.tankClass];
    const groundY = gameState.getTankY(playerIndex);
    const turretY = groundY - classDef.bodyHeight;
    const tip = getBarrelTip(player.tankX, turretY, angle, classDef.barrelLength);

    const trajectory: Position[] = [];
    const dt = 1 / 60;
    let t = 0;
    const maxT = 20;

    let vx = Math.cos(angle) * power;
    let vy = -Math.sin(angle) * power;
    let x = tip.x;
    let y = tip.y;

    while (t < maxT) {
      trajectory.push({ x, y });

      vx += gameState.wind * dt;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;
      t += dt;

      if (x < -50 || x > WORLD_WIDTH + 50 || y > WORLD_HEIGHT + 50) {
        return { trajectory, hitPosition: null, hitPlayerIndex: null };
      }

      if (x >= 0 && x < WORLD_WIDTH) {
        const idx = Math.floor((x / WORLD_WIDTH) * gameState.terrain.length);
        const ci = Math.max(0, Math.min(gameState.terrain.length - 1, idx));
        const terrainY = WORLD_HEIGHT - gameState.terrain[ci];

        if (y >= terrainY - PROJECTILE_RADIUS) {
          const hitPos = { x, y: terrainY };
          trajectory.push(hitPos);

          let hitPlayer: number | null = null;
          for (let i = 0; i < 2; i++) {
            const tX = gameState.players[i].tankX;
            const tY = gameState.getTankY(i);
            const tClassDef = TANK_CLASSES[gameState.players[i].tankClass];
            const dx = Math.abs(hitPos.x - tX);
            const dy = Math.abs(hitPos.y - tY);
            if (dx < tClassDef.bodyWidth && dy < 40) {
              hitPlayer = i;
              break;
            }
          }

          return { trajectory, hitPosition: hitPos, hitPlayerIndex: hitPlayer };
        }
      }

      for (let i = 0; i < 2; i++) {
        if (i === playerIndex) continue;
        const tX = gameState.players[i].tankX;
        const tClassDef = TANK_CLASSES[gameState.players[i].tankClass];
        const tBodyY = gameState.getTankY(i) - tClassDef.bodyHeight / 2;
        const dx = Math.abs(x - tX);
        const dy = Math.abs(y - tBodyY);
        if (dx < tClassDef.bodyWidth / 2 + PROJECTILE_RADIUS && dy < tClassDef.bodyHeight / 2 + PROJECTILE_RADIUS) {
          const hitPos = { x, y };
          trajectory.push(hitPos);
          return { trajectory, hitPosition: hitPos, hitPlayerIndex: i };
        }
      }
    }

    return { trajectory, hitPosition: null, hitPlayerIndex: null };
  }
}
