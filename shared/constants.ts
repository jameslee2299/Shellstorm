// Physics constants
export const GRAVITY = 400; // pixels/sec^2
export const MAX_POWER = 600;
export const MIN_POWER = 100;
export const POWER_CHARGE_SPEED = 400; // pixels/sec charge rate
export const PROJECTILE_RADIUS = 4;
export const EXPLOSION_RADIUS = 40;
export const TERRAIN_DAMAGE_RADIUS = 35;

// Wind
export const MAX_WIND = 150; // pixels/sec^2 horizontal acceleration
export const WIND_CHANGE_MIN = -80;
export const WIND_CHANGE_MAX = 80;

// Tank
export const TANK_WIDTH = 40;
export const TANK_HEIGHT = 20;
export const TANK_BARREL_LENGTH = 28;
export const TANK_BARREL_WIDTH = 6;
export const TANK_MAX_HP = 100;
export const TANK_MOVE_SPEED = 80; // pixels/sec
export const TANK_MOVE_DISTANCE = 60; // max pixels per turn

// Game
export const TURN_TIME_LIMIT = 30; // seconds
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 500;
export const TERRAIN_POINTS = 200;
export const TERRAIN_MIN_HEIGHT = 100;
export const TERRAIN_MAX_HEIGHT = 350;

// Damage
export const DIRECT_HIT_DAMAGE = 40;
export const SPLASH_DAMAGE_MAX = 25;
export const SPLASH_RADIUS = 60;

// Tank class ability constants
export const JACKAL_SPLIT_COUNT = 3;
export const JACKAL_SPLIT_SPREAD = Math.PI / 8;
export const TRICKSHOT_MAX_BOUNCES = 1;
export const AEGIS_WALL_HEIGHT = 60;
export const AEGIS_WALL_WIDTH = 20;
export const DAMAGE_NUMBER_DURATION = 1.5;
export const TURN_ANNOUNCEMENT_DURATION = 1.2;

// Reconnection
export const RECONNECT_TIMEOUT = 30000; // 30 seconds
