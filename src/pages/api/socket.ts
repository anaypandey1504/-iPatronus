import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiResponseServerIO } from '@/lib/utils/socket';
import { initSocketServer } from '@/lib/utils/socket';

export default function handler(req: NextApiRequest, res: NextApiResponse & NextApiResponseServerIO) {
  // @ts-ignore - Next.js exposes the underlying server on res.socket.server
  const server = res.socket.server;
  initSocketServer(server);
  res.end();
}
