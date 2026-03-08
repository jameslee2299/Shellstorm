import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms/RoomManager';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const roomManager = new RoomManager(io);

app.get('/', (_req, res) => {
  const stats = roomManager.getStats();
  res.json({
    status: 'Tank Artillery Server',
    ...stats,
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('match:find', (data: { name: string }) => {
    roomManager.addToQueue(socket, data.name);
  });

  socket.on('match:cancel', () => {
    roomManager.removeFromQueue(socket.id);
  });

  socket.on('game:fire', (data: { angle: number; power: number }) => {
    roomManager.handleFire(socket.id, data);
  });

  socket.on('game:move', (data: { dx: number }) => {
    roomManager.handleMove(socket.id, data.dx);
  });

  socket.on('game:end_move', () => {
    roomManager.handleEndMove(socket.id);
  });

  socket.on('game:reconnect', (data: { roomId: string; playerIndex: number }) => {
    roomManager.handleReconnect(socket, data.roomId, data.playerIndex);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Tank Artillery Server running on port ${PORT}`);
});
