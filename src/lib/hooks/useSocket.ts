import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const DEFAULT_SOCKET_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://ipatronus-production.up.railway.app';

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || DEFAULT_SOCKET_URL;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: false,
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}