'use client';

import { Button } from '@/components/Button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DoctorStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY';

interface Doctor {
  id: string;
  name: string;
  status: DoctorStatus;
}

interface ConnectionRequest {
  patientId: string;
  patientName: string;
}

interface User {
  id: string;
  name: string;
  status: DoctorStatus;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionRequest, setConnectionRequest] = useState<ConnectionRequest | null>(null);

  useEffect(() => {
    // In a real app, you would get the current doctor from the session
    // For now, we'll use the first doctor as the current user
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      if (data.doctors && data.doctors.length > 0) {
        setDoctors(data.doctors);
        // Set the first doctor as the current user for demo purposes
        setCurrentDoctor(data.doctors[0]);
        setUser(data.doctors[0]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const socket = {
      emit: (event: string, data: any) => {
        console.log(`Emitting event: ${event} with data: ${JSON.stringify(data)}`);
      },
      on: (event: string, callback: (data: any) => void) => {
        console.log(`Listening for event: ${event}`);
        callback({ patientId: '123', patientName: 'John Doe' });
      },
      off: (event: string) => {
        console.log(`Removing listener for event: ${event}`);
      },
    };

    socket.emit('join-room', user.id);

    socket.on('incoming-connection', (data: ConnectionRequest) => {
      setConnectionRequest(data);
    });

    return () => {
      socket.off('incoming-connection');
    };
  }, [user]);

  async function toggleAvailability() {
    if (!user) return;

    const newStatus = user.status === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';

    try {
      const res = await fetch('/api/user/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      setUser((prev) => prev ? { ...prev, status: newStatus } : null);
      socket?.emit('status-change', { userId: user.id, status: newStatus });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  }

  async function handleConnectionResponse(accept: boolean) {
    if (!connectionRequest || !user) return;

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: connectionRequest.patientId,
          accepted: accept,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to handle connection');
      }

      if (accept) {
        router.push(`/call/${data.session.roomId}`);
      }

      setConnectionRequest(null);
    } catch (error) {
      console.error('Failed to handle connection:', error);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, Dr. {user.name}</h1>
              <p className="text-gray-600">Status: {user.status}</p>
            </div>
            <Button
              onClick={toggleAvailability}
              variant={user.status === 'AVAILABLE' ? 'danger' : 'primary'}
            >
              {user.status === 'AVAILABLE' ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </div>

        {connectionRequest && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Incoming Connection Request</h2>
            <p className="mb-4">
              Patient {connectionRequest.patientName} would like to connect with you.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => handleConnectionResponse(true)} variant="primary">
                Accept
              </Button>
              <Button onClick={() => handleConnectionResponse(false)} variant="danger">
                Reject
              </Button>
            </div>
          </div>
        )}

        {!connectionRequest && user.status === 'AVAILABLE' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600">
              You are online and available for patient consultations. When a patient
              requests to connect with you, their request will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}