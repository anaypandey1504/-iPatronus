'use client';

import { Button } from '@/components/Button';
import { useSocket } from '@/lib/hooks/useSocket';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ConnectionRequest {
  patientId: string;
  patientName: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const socket = useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [connectionRequest, setConnectionRequest] = useState<ConnectionRequest | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch user');
        }

        if (data.user.role !== 'DOCTOR') {
          router.push('/patient');
          return;
        }

        setUser(data.user);
      } catch (error) {
        router.push('/auth/login');
      }
    }

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join-room', user.id);

    socket.on('incoming-connection', (data: ConnectionRequest) => {
      setConnectionRequest(data);
    });

    return () => {
      socket.off('incoming-connection');
    };
  }, [socket, user]);

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