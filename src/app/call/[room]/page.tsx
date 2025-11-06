'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CallPageProps {
  params: {
    room: string;
  };
}

export default function CallPage({ params }: CallPageProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roomId = params.room;

  useEffect(() => {
    // Set up the Daily iframe
    if (iframeRef.current) {
      iframeRef.current.src = `https://your-daily-domain.daily.co/${roomId}`;
    }

    // Handle beforeunload to clean up
    const handleBeforeUnload = () => {
      // You can add cleanup logic here if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  const handleLeaveCall = () => {
    // Navigate back to the previous page
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