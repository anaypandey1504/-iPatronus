'use client';

import { useRef, useState, useEffect } from 'react';

interface CallRoomProps {
  url: string;
  onLeave?: () => void;
}

export default function CallRoom({ url, onLeave }: CallRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => setLoaded(true);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [loaded]);

  return (
    <div className="w-full h-screen bg-gray-900">
      {loaded && (
        <iframe
          ref={iframeRef}
          title="video call"
          style={{ width: '100%', height: '100%', border: 0 }}
          allow="camera; microphone; fullscreen"
          src={url}
        />
      )}
    </div>
  );
}