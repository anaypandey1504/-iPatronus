'use client';

import { Button } from '@/components/Button';
import { useSocket } from '@/lib/hooks/useSocket';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DoctorStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY';

interface Doctor {
  id: string;
  name: string;
  status: DoctorStatus;
}

interface ConnectionRequest {
  doctorId: string;
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
  const socket = useSocket();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionRequest, setConnectionRequest] = useState<ConnectionRequest | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load doctors');
      }

      setDoctors(data.doctors || []);
      if (data.doctors && data.doctors.length > 0) {
        setUser(data.doctors[0]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join-room', user.id);

    const handleIncomingRequest = (payload: ConnectionRequest) => {
      if (payload.doctorId !== user.id) return;
      setConnectionRequest(payload);
    };

    const handleStatusUpdate = ({
      userId,
      status,
    }: {
      userId: string;
      status: DoctorStatus;
    }) => {
      setDoctors((prev) =>
        prev.map((doctor) => (doctor.id === userId ? { ...doctor, status } : doctor))
      );

      if (userId === user.id) {
        setUser((prev) => (prev ? { ...prev, status } : prev));
      }
    };

    socket.on('INCOMING_REQUEST', handleIncomingRequest);
    socket.on('USER_STATUS_UPDATE', handleStatusUpdate);

    return () => {
      socket.off('INCOMING_REQUEST', handleIncomingRequest);
      socket.off('USER_STATUS_UPDATE', handleStatusUpdate);
    };
  }, [socket, user]);

  async function toggleAvailability() {
    if (!user || !socket) return;

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

      setUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
      socket.emit('USER_STATUS_CHANGE', { userId: user.id, status: newStatus });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  }

  async function handleConnectionResponse(accept: boolean) {
    if (!connectionRequest || !user || !socket) return;

    if (!accept) {
      setConnectionRequest(null);
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user.id,
          patientId: connectionRequest.patientId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create session');
      }

      socket.emit('CALL_ACCEPTED', {
        doctorId: user.id,
        patientId: connectionRequest.patientId,
        roomName: data.session.roomId,
        roomUrl: data.roomUrl,
      });

      setConnectionRequest(null);

      if (data.roomUrl) {
        router.push(`/call/${data.session.roomId}?url=${encodeURIComponent(data.roomUrl)}`);
      } else {
        router.push(`/call/${data.session.roomId}`);
      }
    } catch (error) {
      console.error('Failed to handle connection:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-2">No doctors configured</h2>
          <p className="text-gray-600">Add a doctor record to begin receiving consultation requests.</p>
        </div>
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