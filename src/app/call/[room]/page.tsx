'use client';

import CallRoom from '@/components/CallRoom';
import { useRouter } from 'next/navigation';

interface CallPageProps {
  params: {
    room: string;
  };
}

export default function CallPage({ params }: CallPageProps) {
  const router = useRouter();
  const roomUrl = decodeURIComponent(params.room);

  function handleLeave() {
    router.back();
  }

  return <CallRoom url={roomUrl} onLeave={handleLeave} />;
}