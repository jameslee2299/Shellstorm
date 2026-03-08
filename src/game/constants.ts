// Re-export shared constants
export * from '../../shared/constants';

// Client-only visual constants
export const COLORS = {
  player1: '#4FC3F7',
  player2: '#EF5350',
  player1Dark: '#0288D1',
  player2Dark: '#C62828',
  terrain: '#4CAF50',
  terrainDark: '#2E7D32',
  terrainStroke: '#388E3C',
  skyTop: '#0D1B2A',
  skyBottom: '#1B3A5C',
  ground: '#3E2723',
  projectile: '#FFD54F',
  projectileTrail: '#FFA726',
  explosion: '#FF6F00',
  explosionInner: '#FFD54F',
  hpBar: '#4CAF50',
  hpBarLow: '#F44336',
  hpBarBg: '#424242',
  windArrow: '#B0BEC5',
  text: '#ECEFF1',
  textDim: '#78909C',
  panelBg: 'rgba(13, 27, 42, 0.85)',
  buttonBg: '#1565C0',
  buttonFire: '#D32F2F',
  buttonFireCharging: '#FF6F00',
} as const;

export const TRAIL_MAX_LENGTH = 30;
export const EXPLOSION_DURATION = 0.6; // seconds
export const PARTICLE_COUNT = 20;
export const SCREEN_SHAKE_DURATION = 0.3;
export const SCREEN_SHAKE_INTENSITY = 8;
