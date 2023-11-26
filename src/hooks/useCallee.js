/* eslint-disable object-curly-newline */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import RNCallKeep from 'react-native-callkeep';
import firestore from '@react-native-firebase/firestore';

import useOfferPresence from './useOfferPresence';
import useAppSelector from './useAppSelector';
import { AuthenticationSelector } from '@/redux/AuthenticationSlice';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const useCallee = () => {
  const [roomId, setRoomId] = useState('test');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnection = useRef(new RTCPeerConnection(servers));

  // const { callType } = useAppSelector(CallerCalleeSelector);
  const { user } = useAppSelector(AuthenticationSelector);

  // console.log(user);

  useOfferPresence('rooms', roomId, user);

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

  const joinCall = useCallback(async () => {
    try {
      const roomRef = firestore().collection('rooms').doc('test');
      const roomSnapshot = await roomRef.get();

      if (!roomSnapshot.exists) {
        throw new Error('Room does not exist');
      }

      localStream
        ?.getTracks()
        .forEach((track) => peerConnection?.current?.addTrack(track, localStream));

      const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
      peerConnection.current.onicecandidate = (e) => {
        if (!e.candidate) {
          // console.log('Got final candidate! joinCall');
        } else {
          calleeCandidatesCollection.add(e.candidate ? e.candidate?.toJSON() : null);
        }
      };

      peerConnection.current.ontrack = (event) => {
        // console.log('ontrack event responder:', event);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      const { offer } = roomSnapshot.data();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      const roomWithAnswer = { answer };
      await roomRef.update(roomWithAnswer);

      roomRef.collection('callerCandidates').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    } catch (error) {
      // console.log(error);
    }
  }, [localStream]);

  const logout = useCallback(() => {
    try {
      if (peerConnection.current !== null && localStream) {
        // Parar todas as faixas de mídia
        localStream.getTracks().forEach((track) => {
          track.stop();
        });

        // Remover todas as faixas de vídeo e áudio do RTCPeerConnection
        localStream.getTracks().forEach((track) => {
          const sender = peerConnection.current.getSenders().find((s) => s.track === track);
          if (sender) {
            peerConnection.current.removeTrack(sender);
          }
        });

        // Verificar se a descrição remota está presente antes de acessar
        if (peerConnection.current && peerConnection.current.currentRemoteDescription) {
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

  const handleAnswer = useCallback(async () => {
    try {
      const localStreamResult = await getLocalStream();

      if (Object.keys(localStreamResult).length > 0) {
        await joinCall(localStreamResult);
      } else {
        console.error('Erro ao obter a stream local.');
      }
    } catch (error) {
      console.error('Erro ao obter a stream local ou responder a chamada:', error);
    }
  }, [joinCall, getLocalStream]);

  useEffect(() => {
    const endCallListener = () => {
      // const { callUUID, reason } = data;
      // console.log(`Chamada encerrada com UUID: ${callUUID}, Motivo: ${reason}`);
      logout();
    };

    const startCallListener = () => {
      // const { handle } = data;
      // console.log(`Chamada iniciada com o identificador: ${handle}`);
      // RNCallKeep.displayIncomingCall('12345', 'Fernando');
    };

    const answerCallListener = async () => {
      await handleAnswer();
    };

    RNCallKeep.addEventListener('endCall', endCallListener);
    RNCallKeep.addEventListener('didReceiveStartCallAction', startCallListener);
    RNCallKeep.addEventListener('answerCall', answerCallListener);

    return () => {
      // Certifique-se de remover o ouvinte ao desmontar o componente
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didReceiveStartCallAction');
      RNCallKeep.removeEventListener('answerCall');
    };
  }, [logout, handleAnswer]);

  return { handleAnswer, logout, localStream, remoteStream };
};

export default useCallee;
