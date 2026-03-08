import {
  DIRECT_HIT_DAMAGE,
  SPLASH_DAMAGE_MAX,
  SPLASH_RADIUS,
} from '../../../shared/constants';
import { TANK_CLASSES } from '../../../shared/tankClasses';
import type { Position, PlayerState, TankClassId } from '../../../shared/types';

interface DamageResult {
  damages: [number, number];
  hitPlayerIndex: number | null;
  totalDamage: number;
}

export class DamageCalculator {
  calculate(
    hitPosition: Position | null,
    players: [PlayerState, PlayerState],
    tankYs: [number, number],
    attackerClass: TankClassId = 'soldier'
  ): DamageResult {
    if (!hitPosition) {
      return { damages: [0, 0], hitPlayerIndex: null, totalDamage: 0 };
    }

    const classDef = TANK_CLASSES[attackerClass];
    const damages: [number, number] = [0, 0];
    let hitPlayerIndex: number | null = null;

    for (let i = 0; i < 2; i++) {
      const player = players[i];
      const playerClassDef = TANK_CLASSES[player.tankClass];
      const dx = hitPosition.x - player.tankX;
      const dy = hitPosition.y - tankYs[i];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dmg = this.computeDamage(dist, classDef, playerClassDef.bodyWidth);

      if (dmg > 0) {
        damages[i as 0 | 1] = dmg;
        if (dist < playerClassDef.bodyWidth / 2) {
          hitPlayerIndex = i;
        }
      }
    }

    return {
      damages,
      hitPlayerIndex,
      totalDamage: damages[0] + damages[1],
    };
  }

  private computeDamage(dist: number, classDef: { directHitDamageMultiplier: number; splashRadiusMultiplier: number }, bodyWidth: number): number {
    const directHitRadius = bodyWidth / 2;
    if (dist <= directHitRadius) {
      return Math.round(DIRECT_HIT_DAMAGE * classDef.directHitDamageMultiplier);
    }
    const splashR = SPLASH_RADIUS * classDef.splashRadiusMultiplier;
    if (dist <= splashR) {
      const falloff = 1 - (dist - directHitRadius) / (splashR - directHitRadius);
      return Math.round(SPLASH_DAMAGE_MAX * falloff);
    }
    return 0;
  }
}
