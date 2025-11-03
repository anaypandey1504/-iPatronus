import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface UseWebRTCProps {
  socket: Socket;
  roomId: string;
  isInitiator?: boolean;
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC({ socket, roomId, isInitiator }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    async function setupMediaStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch (err: any) {
        setError('Failed to access camera and microphone: ' + err.message);
      }
    }

    setupMediaStream();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!localStream || !socket) return;

    peerConnection.current = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, localStream);
    });

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(new MediaStream([event.track]));
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signaling', {
          type: 'ice-candidate',
          payload: event.candidate,
          roomId,
        });
      }
    };

    socket.on('signaling', async (data) => {
      try {
        if (data.type === 'offer') {
          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.payload));
          const answer = await peerConnection.current?.createAnswer();
          await peerConnection.current?.setLocalDescription(answer);
          socket.emit('signaling', {
            type: 'answer',
            payload: answer,
            roomId,
          });
        } else if (data.type === 'answer') {
          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.payload));
        } else if (data.type === 'ice-candidate') {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.payload));
        }
      } catch (err: any) {
        setError('WebRTC Error: ' + err.message);
      }
    });

    if (isInitiator) {
      createOffer();
    }

    return () => {
      peerConnection.current?.close();
      socket.off('signaling');
    };
  }, [localStream, socket, roomId, isInitiator]);

  async function createOffer() {
    try {
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      socket.emit('signaling', {
        type: 'offer',
        payload: offer,
        roomId,
      });
    } catch (err: any) {
      setError('Failed to create offer: ' + err.message);
    }
  }

  return {
    localStream,
    remoteStream,
    error,
  };
}