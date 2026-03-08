import { Server, Socket } from 'socket.io';
import { ServerGameState } from '../game/ServerGameState';
import { TurnManager } from '../game/TurnManager';
import { PhysicsEngine } from '../game/PhysicsEngine';
import { DamageCalculator } from '../game/DamageCalculator';

export class GameRoom {
  readonly roomId: string;
  private io: Server;
  private sockets: [Socket | null, Socket | null];
  private socketIds: [string, string];
  private gameState: ServerGameState;
  private turnManager: TurnManager;
  private physics: PhysicsEngine;
  private damage: DamageCalculator;
  private disconnectedAt: [number | null, number | null] = [null, null];
  private originalSocketIds: [string, string]; // for reconnection validation
  private switchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    roomId: string,
    io: Server,
    socket1: Socket,
    socket2: Socket,
    name1: string,
    name2: string
  ) {
    this.roomId = roomId;
    this.io = io;
    this.sockets = [socket1, socket2];
    this.socketIds = [socket1.id, socket2.id];
    this.originalSocketIds = [socket1.id, socket2.id];
    this.gameState = new ServerGameState(name1, name2);
    this.turnManager = new TurnManager(this.gameState, () => this.onTurnTimeout());
    this.physics = new PhysicsEngine();
    this.damage = new DamageCalculator();
  }

  start(): void {
    this.gameState.init();
    this.turnManager.startTurn();
    this.broadcast('game:start', this.gameState.getClientState());
  }

  handleFire(socketId: string, data: { angle: number; power: number }): void {
    let { angle, power } = data;
    const playerIndex = this.getPlayerIndex(socketId);
    if (playerIndex === -1) return;
    if (playerIndex !== this.gameState.activePlayerIndex) return;
    if (this.gameState.phase !== 'AIM') return;

    // Clamp values
    angle = Math.max(0.05, Math.min(Math.PI - 0.05, angle));
    power = Math.max(100, Math.min(600, power));

    this.gameState.phase = 'FIRING';

    // Compute trajectory server-side
    const result = this.physics.computeShot(
      this.gameState,
      playerIndex,
      angle,
      power
    );

    // Apply damage - pass tank Y positions for accurate 2D distance
    const tankYs: [number, number] = [
      this.gameState.getTankY(0),
      this.gameState.getTankY(1),
    ];
    const damageResult = this.damage.calculate(
      result.hitPosition,
      this.gameState.players,
      tankYs
    );

    // Apply terrain deformation
    if (result.hitPosition) {
      this.gameState.applyExplosion(result.hitPosition.x);
    }

    // Apply HP changes
    for (let i = 0; i < 2; i++) {
      this.gameState.players[i].hp = Math.max(
        0,
        this.gameState.players[i].hp - damageResult.damages[i]
      );
    }

    // Check game over
    let gameOver = false;
    let winner: number | null = null;
    if (this.gameState.players[0].hp <= 0) {
      gameOver = true;
      winner = 1;
    } else if (this.gameState.players[1].hp <= 0) {
      gameOver = true;
      winner = 0;
    }

    this.gameState.winner = winner;

    // Broadcast result
    this.broadcast('game:fire_result', {
      trajectory: result.trajectory,
      hitPosition: result.hitPosition,
      hitPlayerIndex: damageResult.hitPlayerIndex,
      damage: damageResult.totalDamage,
      newTerrain: this.gameState.terrain,
      playerHPs: [this.gameState.players[0].hp, this.gameState.players[1].hp] as [number, number],
      gameOver,
      winner,
    });

    if (gameOver) {
      this.gameState.phase = 'GAME_OVER';
      this.turnManager.stop();
      this.broadcast('game:over', { winner });
    } else {
      // Switch turns after a delay
      this.gameState.phase = 'RESOLVING';
      if (this.switchTimer) clearTimeout(this.switchTimer);
      this.switchTimer = setTimeout(() => {
        this.switchTimer = null;
        if (this.gameState.phase !== 'GAME_OVER') {
          this.switchTurn();
        }
      }, 1500);
    }
  }

  handleMove(socketId: string, dx: number): void {
    const playerIndex = this.getPlayerIndex(socketId);
    if (playerIndex === -1) return;
    if (playerIndex !== this.gameState.activePlayerIndex) return;
    if (this.gameState.phase !== 'MOVE') return;

    this.gameState.moveTank(playerIndex, dx);
    this.broadcast('game:state', this.gameState.getClientState());
  }

  handleEndMove(socketId: string): void {
    const playerIndex = this.getPlayerIndex(socketId);
    if (playerIndex === -1) return;
    if (playerIndex !== this.gameState.activePlayerIndex) return;
    if (this.gameState.phase !== 'MOVE') return;

    this.gameState.phase = 'AIM';
    this.broadcast('game:state', this.gameState.getClientState());
  }

  handleDisconnect(socketId: string): void {
    const idx = this.getPlayerIndex(socketId);
    if (idx !== -1) {
      this.sockets[idx] = null;
      this.disconnectedAt[idx] = Date.now();
      // Notify opponent
      const opponentIdx = idx === 0 ? 1 : 0;
      this.sockets[opponentIdx]?.emit('opponent:disconnected');
    }
  }

  handleReconnect(socket: Socket, playerIndex: number): void {
    // Validate player index
    if (playerIndex !== 0 && playerIndex !== 1) return;
    if (this.sockets[playerIndex] !== null) return; // slot not vacant
    if (this.disconnectedAt[playerIndex] === null) return; // wasn't disconnected

    this.sockets[playerIndex] = socket;
    this.socketIds[playerIndex] = socket.id;
    this.disconnectedAt[playerIndex] = null;

    // Send full state
    socket.emit('game:state', this.gameState.getClientState());

    // Notify opponent
    const opponentIdx = playerIndex === 0 ? 1 : 0;
    this.sockets[opponentIdx]?.emit('opponent:reconnected');

  }

  shouldCleanup(): boolean {
    // Cleanup if both disconnected, or game is over
    if (this.gameState.phase === 'GAME_OVER') return true;
    return this.sockets[0] === null && this.sockets[1] === null;
  }

  private switchTurn(): void {
    this.gameState.switchTurn();
    this.turnManager.startTurn();
    this.broadcast('game:turn_switch', {
      activePlayerIndex: this.gameState.activePlayerIndex,
      wind: this.gameState.wind,
    });
    this.broadcast('game:state', this.gameState.getClientState());
  }

  private onTurnTimeout(): void {
    // Player took too long — skip their turn
    this.switchTurn();
  }

  private getPlayerIndex(socketId: string): number {
    if (this.socketIds[0] === socketId) return 0;
    if (this.socketIds[1] === socketId) return 1;
    return -1;
  }

  private broadcast(event: string, data: unknown): void {
    this.io.to(this.roomId).emit(event, data);
  }
}
