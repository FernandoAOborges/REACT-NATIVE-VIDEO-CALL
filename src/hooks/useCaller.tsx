/* eslint-disable object-curly-newline */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from 'react-native-webrtc';
import RNCallKeep from 'react-native-callkeep';
import firestore from '@react-native-firebase/firestore';

import { API_URL } from '@env';
import {
  EFirebaseCollectionsProps,
  EFirebaseFoldersProps,
  IServerConfigProps,
  IUsersProps,
} from '@/types/Types';

interface IUseCallerProps {
  dataUserRequest: IUsersProps;
  user: IUsersProps;
}

const useCaller = ({ dataUserRequest, user }: IUseCallerProps) => {
  const [roomId, setRoomId] = useState<string>('test');
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [serverCOnfig, setserverCOnfig] = useState<IServerConfigProps>({
    iceServers: [],
  });

  const logout = useCallback(async () => {
    try {
      if (peerConnection.current !== null && localStream) {
        // Parar todas as faixas de mídia
        localStream.getTracks().forEach((track) => {
          track.stop();
        });

        // Remover todas as faixas de vídeo e áudio do RTCPeerConnection
        localStream.getTracks().forEach((track) => {
          const sender = peerConnection.current?.getSenders().find((s) => s.track === track);
          if (sender) {
            peerConnection.current?.removeTrack(sender);
          }
        });

        // Verificar se a descrição remota está presente antes de acessar
        if (peerConnection.current.currentRemoteDescription) {
          peerConnection.current.close();
        }
      }

      peerConnection.current = null;
      setLocalStream(null);
      setRemoteStream(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [localStream]);

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

    return stream;
  }, []);

  const createCall = useCallback(
    async (localStreamResult: MediaStream) => {
      try {
        if (serverCOnfig.iceServers.length === 0) {
          return;
        }

        peerConnection.current = new RTCPeerConnection(serverCOnfig);
        localStreamResult
          .getTracks()
          .forEach((track) => peerConnection.current?.addTrack(track, localStreamResult));

        const roomRef = firestore().collection(EFirebaseFoldersProps.ROOMS).doc(roomId);
        const callerCandidatesCollection = roomRef.collection(
          EFirebaseCollectionsProps.CALLER_CANDIDATES,
        );

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        peerConnection.current.onicecandidate = (e) => {
          if (!e.candidate) {
            // console.log('Got final candidate! joinCall');
            return;
          }
          callerCandidatesCollection.add(e.candidate ? e.candidate?.toJSON() : null);
        };

        peerConnection.current.ontrack = (event) => {
          // console.log('ontrack event:', event);
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        const userData = {
          call_id: roomId,
          sender: user.id,
          receiver: dataUserRequest.id,
          status: 'waiting',
          timestamp: new Date().getTime(),
        };

        const roomWithOffer = { offer, userData };
        await roomRef.set(roomWithOffer);

        roomRef.onSnapshot(async (snapshot) => {
          const data = snapshot.data();
          if (
            peerConnection.current &&
            !peerConnection.current.currentRemoteDescription &&
            data?.answer
          ) {
            const rtcSessionDescription = new RTCSessionDescription(data?.answer);
            await peerConnection.current.setRemoteDescription(rtcSessionDescription);
            // setHasAnswer(true);
          }
        });

        roomRef.collection(EFirebaseCollectionsProps.CALLEE_CANDIDATES).onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });

        RNCallKeep.startCall(dataUserRequest?.name, 'Call', dataUserRequest?.name);

        // setCachedLocalPC(localPC);
      } catch (error) {
        console.log(error);
      }
    },
    [roomId, serverCOnfig, dataUserRequest, user?.id],
  );

  const handleConnection = useCallback(async () => {
    try {
      const localStreamResult = await getLocalStream();

      if (Object.keys(localStreamResult).length > 0) {
        await createCall(localStreamResult);
      } else {
        console.error('Erro ao obter a stream local.');
      }
    } catch (error) {
      console.error('Erro ao obter a stream local ou criar a chamada:', error);
    }
  }, [createCall, getLocalStream]);

  useEffect(() => {
    try {
      const getIceServers = async () => {
        const response = await fetch(API_URL);
        const iceServers = await response.json();

        setserverCOnfig((prev) => ({
          ...prev,
          iceServers,
        }));
      };

      getIceServers();
    } catch (error) {
      // console.log(error);
    }
  }, []);

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
    };

    RNCallKeep.addEventListener('endCall', handleLogout);

    return () => {
      RNCallKeep.removeEventListener('endCall');
    };
  }, [logout]);

  return { handleConnection, logout, localStream, remoteStream };
};

export default useCaller;
