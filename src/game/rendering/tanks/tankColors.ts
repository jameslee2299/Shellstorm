import type { TankClassId } from '../../../../shared/types';

export interface TankComponentProps {
  x: number;
  y: number; // ground Y position
  angle: number;
  hp: number;
  maxHp: number;
  isActive: boolean;
  facingRight: boolean;
}

export const TANK_PALETTES: Record<TankClassId, {
  body: string;
  bodyDark: string;
  accent: string;
  track: string;
  barrel: string;
  turret: string;
}> = {
  soldier: {
    body: '#6B8E23',
    bodyDark: '#4A6318',
    accent: '#556B2F',
    track: '#3D3D3D',
    barrel: '#4A6318',
    turret: '#556B2F',
  },
  bertha: {
    body: '#8B6914',
    bodyDark: '#5C4A0E',
    accent: '#A0522D',
    track: '#3D3D3D',
    barrel: '#5C4A0E',
    turret: '#6B4E0A',
  },
  jackal: {
    body: '#DAA520',
    bodyDark: '#B8860B',
    accent: '#FFD700',
    track: '#3D3D3D',
    barrel: '#B8860B',
    turret: '#CD950C',
  },
  longbow: {
    body: '#4682B4',
    bodyDark: '#2C5F85',
    accent: '#5F9EA0',
    track: '#3D3D3D',
    barrel: '#2C5F85',
    turret: '#36648B',
  },
  trickshot: {
    body: '#9370DB',
    bodyDark: '#6A4FB0',
    accent: '#BA55D3',
    track: '#3D3D3D',
    barrel: '#6A4FB0',
    turret: '#7B5EAA',
  },
  aegis: {
    body: '#20B2AA',
    bodyDark: '#147A75',
    accent: '#48D1CC',
    track: '#3D3D3D',
    barrel: '#147A75',
    turret: '#1A9A94',
  },
};
