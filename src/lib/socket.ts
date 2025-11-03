import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { store } from './store';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer;

interface ConnectionRequest {
  doctorId: string;
  patientId: string;
}

export function initSocketServer(server: NetServer) {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Doctor status updates
      socket.on('doctor_status_update', ({ doctorId, status }) => {
        const doctor = store.updateDoctorStatus(doctorId, status);
        if (doctor) {
          io.emit('doctor_status_changed', { doctor });
        }
      });

      // Patient requests connection
      socket.on('patient_request_to_doctor', (data: ConnectionRequest) => {
        io.emit(`doctor_${data.doctorId}_request`, {
          patientId: data.patientId,
        });
      });

      // Doctor accepts/rejects request
      socket.on('doctor_response', ({ sessionId, accepted, roomUrl }) => {
        const session = store.updateSessionStatus(
          sessionId,
          accepted ? 'ACCEPTED' : 'REJECTED'
        );
        if (session) {
          io.emit(`patient_${session.patientId}_response`, {
            accepted,
            roomUrl,
            doctorName: store.getDoctor(session.doctorId)?.name,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
}