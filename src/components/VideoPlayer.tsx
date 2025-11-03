import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

export function VideoPlayer({ stream, muted, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover rounded-lg ${className}`}
    />
  );
}