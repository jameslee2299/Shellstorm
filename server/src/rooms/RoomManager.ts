import { Server, Socket } from 'socket.io';
import { GameRoom } from './GameRoom';

interface QueueEntry {
  socket: Socket;
  name: string;
  joinedAt: number;
}

export class RoomManager {
  private io: Server;
  private queue: QueueEntry[] = [];
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // socketId → roomId

  constructor(io: Server) {
    this.io = io;
  }

  addToQueue(socket: Socket, name: string): void {
    // Remove if already in queue
    this.removeFromQueue(socket.id);

    this.queue.push({ socket, name, joinedAt: Date.now() });
    socket.emit('match:waiting');
    console.log(`${name} joined queue. Queue size: ${this.queue.length}`);

    // Try to match
    if (this.queue.length >= 2) {
      const p1 = this.queue.shift()!;
      const p2 = this.queue.shift()!;
      this.createRoom(p1, p2);
    }
  }

  removeFromQueue(socketId: string): void {
    this.queue = this.queue.filter((e) => e.socket.id !== socketId);
  }

  private createRoom(p1: QueueEntry, p2: QueueEntry): void {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const room = new GameRoom(roomId, this.io, p1.socket, p2.socket, p1.name, p2.name);

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(p1.socket.id, roomId);
    this.playerRoomMap.set(p2.socket.id, roomId);

    // Join socket.io rooms
    p1.socket.join(roomId);
    p2.socket.join(roomId);

    // Notify players
    p1.socket.emit('match:found', { roomId, playerIndex: 0 });
    p2.socket.emit('match:found', { roomId, playerIndex: 1 });

    console.log(`Room created: ${roomId} (${p1.name} vs ${p2.name})`);

    // Start the game
    room.start();
  }

  handleFire(socketId: string, data: { angle: number; power: number }): void {
    const room = this.getPlayerRoom(socketId);
    if (room) {
      room.handleFire(socketId, data);
    }
  }

  handleMove(socketId: string, dx: number): void {
    const room = this.getPlayerRoom(socketId);
    if (room) {
      room.handleMove(socketId, dx);
    }
  }

  handleEndMove(socketId: string): void {
    const room = this.getPlayerRoom(socketId);
    if (room) {
      room.handleEndMove(socketId);
    }
  }

  handleReconnect(socket: Socket, roomId: string, playerIndex: number): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.handleReconnect(socket, playerIndex);
      this.playerRoomMap.set(socket.id, roomId);
      socket.join(roomId);
    }
  }

  handleDisconnect(socketId: string): void {
    this.removeFromQueue(socketId);

    const room = this.getPlayerRoom(socketId);
    if (room) {
      room.handleDisconnect(socketId);
      // Don't remove room immediately — allow reconnection
      setTimeout(() => {
        if (room.shouldCleanup()) {
          this.rooms.delete(room.roomId);
          console.log(`Room cleaned up: ${room.roomId}`);
        }
      }, 30000);
    }
    this.playerRoomMap.delete(socketId);
  }

  private getPlayerRoom(socketId: string): GameRoom | undefined {
    const roomId = this.playerRoomMap.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getStats() {
    return {
      queueSize: this.queue.length,
      activeRooms: this.rooms.size,
      connectedPlayers: this.playerRoomMap.size,
    };
  }
}
