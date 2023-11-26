/* eslint-disable object-curly-newline */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { API_URL } from '@env';
import RNCallKeep from 'react-native-callkeep';
import firestore from '@react-native-firebase/firestore';
import useAppDispatch from './useAppDispatch';
import { setCallType } from '@/redux/CallerCalleeSlice';
import { ECallTypeProps } from '@/types/Types';

const useCaller = ({ name }) => {
  const [roomId, setRoomId] = useState('test');
  const peerConnection = useRef(null);

  const dispatch = useAppDispatch();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [serverCOnfig, setserverCOnfig] = useState({
    iceServers: [],
  });

  const handleDispatchCallerCalle = useCallback(
    (value) => {
      dispatch(setCallType(value));
    },
    [dispatch],
  );

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
        if (peerConnection.current.currentRemoteDescription) {
          peerConnection.current.close();
        }
      }

      peerConnection.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      handleDispatchCallerCalle(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [localStream, handleDispatchCallerCalle]);

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
    async (localStreamResult) => {
      try {
        if (serverCOnfig.iceServers.length === 0) {
          return;
        }

        peerConnection.current = new RTCPeerConnection(serverCOnfig);
        localStreamResult
          .getTracks()
          .forEach((track) => peerConnection.current.addTrack(track, localStreamResult));

        const roomRef = firestore().collection('rooms').doc(roomId);
        const callerCandidatesCollection = roomRef.collection('callerCandidates');

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

        const roomWithOffer = { offer };
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

        roomRef.collection('calleeCandidates').onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });

        RNCallKeep.startCall(name, 'Call', name);

        // setCachedLocalPC(localPC);
      } catch (error) {
        // console.log(error);
      }
    },
    [name, roomId, serverCOnfig],
  );

  const handleConnection = useCallback(async () => {
    try {
      const localStreamResult = await getLocalStream();

      if (Object.keys(localStreamResult).length > 0) {
        await createCall(localStreamResult);
        handleDispatchCallerCalle(ECallTypeProps.CALLER);
      } else {
        console.error('Erro ao obter a stream local.');
      }
    } catch (error) {
      console.error('Erro ao obter a stream local ou criar a chamada:', error);
    }
  }, [createCall, getLocalStream, handleDispatchCallerCalle]);

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
    RNCallKeep.addEventListener('endCall', logout);

    return () => {
      RNCallKeep.removeEventListener('endCall');
    };
  }, [logout]);

  return { handleConnection, logout, localStream, remoteStream };
};

export default useCaller;
