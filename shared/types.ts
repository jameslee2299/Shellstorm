export type TurnPhase =
  | 'WAITING'      // Waiting for game to start
  | 'MOVE'         // Active player can move tank
  | 'AIM'          // Active player aiming
  | 'FIRING'       // Projectile in flight
  | 'RESOLVING'    // Explosion + damage
  | 'SWITCHING'    // Switching to next player
  | 'GAME_OVER';   // Game ended

export type TankClassId = 'soldier' | 'bertha' | 'jackal' | 'longbow' | 'trickshot' | 'aegis';

export type SpecialAbility = 'none' | 'big_explosion' | 'split_shot' | 'precision' | 'bounce' | 'wall';

export interface TankClassDef {
  id: TankClassId;
  name: string;
  description: string;
  maxHp: number;
  moveDistance: number;
  explosionRadiusMultiplier: number;
  directHitDamageMultiplier: number;
  splashRadiusMultiplier: number;
  terrainDamageMultiplier: number;
  specialAbility: SpecialAbility;
  barrelLength: number;
  bodyWidth: number;
  bodyHeight: number;
  color: string;
  darkColor: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  name: string;
  tankX: number;
  hp: number;
  angle: number; // radians, 0 = right, PI/2 = up
  color: string;
  moveDistanceLeft: number;
  tankClass: TankClassId;
}

export interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: Position[];
  ownerClass?: TankClassId;
  hasBounced?: boolean;
  splitSpawned?: boolean;
  isSubProjectile?: boolean;
  isAltFire?: boolean;
}

export interface ExplosionState {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  progress: number; // 0-1
  particles: ParticleState[];
}

export interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number; // 0-1
  maxLife: number;
}

export interface DamageNumber {
  x: number;
  y: number;
  damage: number;
  age: number;
  maxAge: number;
  color: string;
}

export interface GameState {
  phase: TurnPhase;
  activePlayerIndex: number; // 0 or 1
  players: [PlayerState, PlayerState];
  terrain: number[]; // heightmap array
  terrainSeed: number;
  wind: number; // horizontal acceleration (positive = right)
  projectile: ProjectileState | null;
  explosion: ExplosionState | null;
  turnTimeLeft: number;
  winner: number | null; // player index or null
  subProjectiles: ProjectileState[];
  damageNumbers: DamageNumber[];
  turnAnnouncement: { playerName: string; playerColor: string; age: number } | null;
  screenShake: number;
}

export interface FireAction {
  angle: number;
  power: number;
}

export interface MoveAction {
  dx: number; // displacement
}

// Socket.io event payloads
export interface ServerEvents {
  'game:state': (state: GameState) => void;
  'game:start': (state: GameState) => void;
  'game:fire_result': (result: FireResult) => void;
  'game:turn_switch': (data: { activePlayerIndex: number; wind: number }) => void;
  'game:over': (data: { winner: number }) => void;
  'match:found': (data: { roomId: string; playerIndex: number }) => void;
  'match:waiting': () => void;
  'opponent:disconnected': () => void;
  'opponent:reconnected': () => void;
}

export interface ClientEvents {
  'match:find': (data: { name: string }) => void;
  'match:cancel': () => void;
  'game:fire': (action: FireAction) => void;
  'game:move': (action: MoveAction) => void;
  'game:end_move': () => void;
  'game:reconnect': (data: { roomId: string }) => void;
}

export interface FireResult {
  trajectory: Position[];
  hitPosition: Position;
  hitPlayerIndex: number | null;
  damage: number;
  newTerrain: number[];
  playerHPs: [number, number];
  gameOver: boolean;
  winner: number | null;
}
