import type { PlayerState, TankClassId } from '../../../shared/types';
import { TANK_CLASSES } from '../../../shared/tankClasses';

export function createTank(
  id: string,
  name: string,
  tankX: number,
  tankClass: TankClassId = 'soldier',
  facingRight: boolean = true
): PlayerState {
  const classDef = TANK_CLASSES[tankClass];
  return {
    id,
    name,
    tankX,
    hp: classDef.maxHp,
    angle: facingRight ? Math.PI / 4 : (3 * Math.PI) / 4,
    color: classDef.color,
    moveDistanceLeft: classDef.moveDistance,
    tankClass,
  };
}

export function isTankAlive(tank: PlayerState): boolean {
  return tank.hp > 0;
}
