import { v4 as uuidv4 } from 'uuid';

type DoctorStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY';
type SessionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

interface Doctor {
  id: string;
  name: string;
  status: DoctorStatus;
}

interface Patient {
  id: string;
  name: string;
}

interface Session {
  id: string;
  doctorId: string;
  patientId: string;
  roomId: string;
  status: SessionStatus;
  createdAt: Date;
}

// Mock data
let doctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Smith', status: 'AVAILABLE' },
  { id: 'doc2', name: 'Dr. Johnson', status: 'AVAILABLE' },
  { id: 'doc3', name: 'Dr. Williams', status: 'NOT_AVAILABLE' },
];

let patients: Patient[] = [
  { id: 'pat1', name: 'John Doe' },
  { id: 'pat2', name: 'Jane Smith' },
];

let sessions: Session[] = [];

// Doctor functions
export const getDoctors = (): Doctor[] => {
  return [...doctors];
};

export const updateDoctorStatus = (doctorId: string, status: DoctorStatus): Doctor | null => {
  const doctorIndex = doctors.findIndex(doc => doc.id === doctorId);
  if (doctorIndex === -1) return null;
  
  doctors[doctorIndex] = { ...doctors[doctorIndex], status };
  return doctors[doctorIndex];
};

// Session functions
export const getSessions = (): Session[] => {
  return [...sessions];
};

export const createSession = (doctorId: string, patientId: string): Session => {
  const roomId = `room-${uuidv4()}`;
  const newSession: Session = {
    id: uuidv4(),
    doctorId,
    patientId,
    roomId,
    status: 'PENDING',
    createdAt: new Date(),
  };
  
  sessions.push(newSession);
  // Update doctor status to BUSY
  updateDoctorStatus(doctorId, 'BUSY');
  
  return newSession;
};

export const updateSessionStatus = (sessionId: string, status: SessionStatus): Session | null => {
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return null;
  
  sessions[sessionIndex] = { ...sessions[sessionIndex], status };
  
  // If session is completed, make doctor available again
  if (status === 'COMPLETED' || status === 'REJECTED') {
    const session = sessions[sessionIndex];
    updateDoctorStatus(session.doctorId, 'AVAILABLE');
  }
  
  return sessions[sessionIndex];
};

export const getSessionByRoomId = (roomId: string): Session | undefined => {
  return sessions.find(session => session.roomId === roomId);
};
