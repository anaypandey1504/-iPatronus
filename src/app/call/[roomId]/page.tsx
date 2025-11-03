'use client';

import { VideoPlayer } from '@/components/VideoPlayer';
import { useWebRTC } from '@/lib/hooks/useWebRTC';
import { useSocket } from '@/lib/hooks/useSocket';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

interface CallPageProps {
  params: {
    roomId: string;
  };
}

interface Session {
  id: string;
  doctorId: string;
  patientId: string;
  roomId: string;
  status: string;
}

export default function CallPage({ params: { roomId } }: CallPageProps) {
  const router = useRouter();
  const socket = useSocket();
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch user');
        }

        setUser(data.user);
      } catch (error) {
        router.push('/auth/login');
      }
    }

    fetchUser();
  }, [router]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${roomId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch session');
        }

        setSession(data.session);
      } catch (error) {
        router.push('/');
      }
    }

    if (roomId) {
      fetchSession();
    }
  }, [roomId, router]);

  useEffect(() => {
    if (!socket || !user || !roomId) return;

    socket.emit('join-room', roomId);
  }, [socket, user, roomId]);

  const { localStream, remoteStream, error } = useWebRTC({
    socket: socket!,
    roomId,
    isInitiator: user?.role === 'PATIENT',
  });

  async function endCall() {
    if (!session) return;

    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (user?.role === 'DOCTOR') {
        router.push('/doctor');
      } else {
        router.push('/patient');
      }
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }

  if (!user || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <VideoPlayer
              stream={localStream}
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <VideoPlayer
              stream={remoteStream}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={endCall} variant="danger">
            End Call
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500 bg-opacity-20 rounded-lg text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}