import { useCallback, useRef, useState } from 'react';
import { mediaDevices, RTCPeerConnection, MediaStream } from 'react-native-webrtc';

// CONSTRUCTION

// interface IServerConfig {
//   iceServers: {
//     urls: string;
//     username?: string;
//     credential?: string;
//   }[];
//   iceCandidatePoolSize?: number;
// }

const useWebRTCHook = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const setupPeerConnection = useCallback((stream: MediaStream) => {
    // const pc = new RTCPeerConnection();
    // stream.getTracks().forEach((track) => {
    //   pc.addTrack(track, stream);
    // });
    // Configurações adicionais para pc...
    // peerConnection.current = pc;
  }, []);

  const getLocalStream = useCallback(async () => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 500,
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode: 'user',
      },
    });
    setLocalStream(stream);
    setupPeerConnection(stream);

    return stream;
  }, [setupPeerConnection]);

  const cleanup = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();
    setLocalStream(null);
    setRemoteStream(null);
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    getLocalStream,
    peerConnection: peerConnection.current,
    setupPeerConnection,
    cleanup,
  };
};

export default useWebRTCHook;
