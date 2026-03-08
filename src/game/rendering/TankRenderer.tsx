import React from 'react';
import type { TankClassId } from '../../../shared/types';
import { SoldierTank } from './tanks/SoldierTank';
import { BerthaTank } from './tanks/BerthaTank';
import { JackalTank } from './tanks/JackalTank';
import { LongbowTank } from './tanks/LongbowTank';
import { TrickshotTank } from './tanks/TrickshotTank';
import { AegisTank } from './tanks/AegisTank';
import type { TankComponentProps } from './tanks/tankColors';

interface Props extends TankComponentProps {
  tankClass: TankClassId;
}

const TANK_COMPONENTS: Record<TankClassId, React.FC<TankComponentProps>> = {
  soldier: SoldierTank,
  bertha: BerthaTank,
  jackal: JackalTank,
  longbow: LongbowTank,
  trickshot: TrickshotTank,
  aegis: AegisTank,
};

export const TankRenderer: React.FC<Props> = ({ tankClass, ...props }) => {
  const Component = TANK_COMPONENTS[tankClass] ?? SoldierTank;
  return <Component {...props} />;
};
