import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Socket } from 'net';
import { Server as ServerIO } from 'socket.io';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

interface ConnectionRequest {
  doctorId: string;
  patientId: string;
}

interface SignalingData {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: any;
  roomId: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer;

export function initSocketServer(server: NetServer) {
  if (!io) {
    io = new ServerIO(server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket: any) => {
      // Using 'any' compatible typing for runtime socket; explicit payloads typed below
      console.log('Client connected:', socket.id);

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on('connection-request', (data: ConnectionRequest) => {
        io.to(data.doctorId).emit('incoming-connection', {
          patientId: data.patientId,
        });
      });

      socket.on('signaling', (data: SignalingData) => {
        socket.to(data.roomId).emit('signaling', {
          type: data.type,
          payload: data.payload,
        });
      });

      socket.on('status-change', ({ userId, status }: { userId: string; status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY' }) => {
        io.emit('user-status-update', { userId, status });
      });

      // Relay when a doctor accepts a call to the specific patient room
      socket.on(
        'call-accepted',
        ({ patientId, roomName, roomUrl }: { patientId: string; roomName: string; roomUrl: string }) => {
          io.to(patientId).emit('call-accepted', { roomName, roomUrl });
        }
      );

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
}