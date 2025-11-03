// Types for our in-memory store
export interface Doctor {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY';
}

export interface Session {
  id: string;
  doctorId: string;
  patientId: string;
  roomUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
}

// In-memory data store
class Store {
  private doctors: Map<string, Doctor>;
  private sessions: Map<string, Session>;

  constructor() {
    this.doctors = new Map();
    this.sessions = new Map();

    // Add some test doctors
    this.doctors.set('d1', {
      id: 'd1',
      name: 'Dr. Smith',
      status: 'NOT_AVAILABLE',
    });
    this.doctors.set('d2', {
      id: 'd2',
      name: 'Dr. Johnson',
      status: 'NOT_AVAILABLE',
    });
  }

  // Doctor methods
  getDoctors(): Doctor[] {
    return Array.from(this.doctors.values());
  }

  getDoctor(id: string): Doctor | undefined {
    return this.doctors.get(id);
  }

  updateDoctorStatus(id: string, status: Doctor['status']): Doctor | undefined {
    const doctor = this.doctors.get(id);
    if (doctor) {
      doctor.status = status;
      this.doctors.set(id, doctor);
    }
    return doctor;
  }

  // Session methods
  createSession(
    doctorId: string,
    patientId: string,
    roomUrl: string
  ): Session {
    const session: Session = {
      id: Math.random().toString(36).substring(7),
      doctorId,
      patientId,
      roomUrl,
      status: 'PENDING',
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  updateSessionStatus(id: string, status: Session['status']): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      this.sessions.set(id, session);
    }
    return session;
  }

  // Get active session for a doctor
  getDoctorActiveSession(doctorId: string): Session | undefined {
    return Array.from(this.sessions.values()).find(
      (session) =>
        session.doctorId === doctorId &&
        ['PENDING', 'ACCEPTED'].includes(session.status)
    );
  }
}

// Export a singleton instance
export const store = new Store();