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

import { AuthenticationSelector } from '@/redux/AuthenticationSlice';

import useOfferPresence from './useOfferPresence';
import useAppSelector from './useAppSelector';
import { EFirebaseCollectionsProps, EFirebaseFoldersProps } from '@/types/Types';

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
  // const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(new RTCPeerConnection(servers));

  const { user } = useAppSelector(AuthenticationSelector);

  useOfferPresence(EFirebaseFoldersProps.ROOMS, roomId, user);

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
      const roomRef = firestore().collection(EFirebaseFoldersProps.ROOMS).doc(roomId);
      const roomSnapshot = await roomRef.get();

      if (!roomSnapshot.exists) {
        throw new Error('Room does not exist');
      }

      localStream
        ?.getTracks()
        .forEach((track) => peerConnection?.current?.addTrack(track, localStream));

      const calleeCandidatesCollection = roomRef.collection(
        EFirebaseCollectionsProps.CALLEE_CANDIDATES,
      );
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
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);

      const roomWithAnswer = { answer };
      await roomRef.update(roomWithAnswer);

      roomRef.collection(EFirebaseCollectionsProps.CALLER_CANDIDATES).onSnapshot((snapshot) => {
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
  }, [localStream, roomId]);

  const logout = useCallback(() => {
    try {
      if (peerConnection.current !== null && localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });

        localStream.getTracks().forEach((track) => {
          const sender = peerConnection.current.getSenders().find((s) => s.track === track);
          if (sender) {
            peerConnection.current.removeTrack(sender);
          }
        });

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
        await joinCall();
      } else {
        console.error('Erro ao obter a stream local.');
      }
    } catch (error) {
      console.error('Erro ao obter a stream local ou responder a chamada:', error);
    }
  }, [joinCall, getLocalStream]);

  useEffect(() => {
    const endCallListener = () => {
      logout();
    };

    const answerCallListener = async () => {
      await handleAnswer();
    };

    RNCallKeep.addEventListener('endCall', endCallListener);
    RNCallKeep.addEventListener('answerCall', answerCallListener);

    return () => {
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('answerCall');
    };
  }, [logout, handleAnswer]);

  return { handleAnswer, logout, localStream, remoteStream };
};

export default useCallee;
