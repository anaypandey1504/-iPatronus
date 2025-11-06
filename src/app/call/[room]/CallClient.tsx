'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CallClient({ room, roomUrl }: { room: string; roomUrl?: string }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;

  useEffect(() => {
    if (iframeRef.current) {
      if (roomUrl) {
        iframeRef.current.src = roomUrl;
      } else {
        const domain = dailyDomain || 'your-subdomain.daily.co';
        iframeRef.current.src = `https://${domain}/${room}`;
      }
    }

    const handleBeforeUnload = () => {
      // placeholder for cleanup if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [room, roomUrl, dailyDomain]);

  const handleLeaveCall = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Video Consultation</h1>
        <button
          onClick={handleLeaveCall}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Leave Call
        </button>
      </div>

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          allow="camera;microphone;display-capture"
        />
      </div>
    </div>
  );
}
