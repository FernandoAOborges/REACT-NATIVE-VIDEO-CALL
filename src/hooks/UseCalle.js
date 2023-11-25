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

const useCalle = () => {
  const [roomId, setRoomId] = useState('test');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);

  const { call } = useOfferPresence('rooms', 'test');

  // console.log('remoteStream: ', remoteStream?.toURL());

  useEffect(() => {
    const getLocalStream = async () => {
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
    };

    getLocalStream();
  }, []);

  useEffect(() => {
    if (call) {
      RNCallKeep.displayIncomingCall('12345', 'Fernando');
    }
  }, [call]);

  const joinCall = async (id) => {
    try {
      peerConnection.current = new RTCPeerConnection(servers);

      const roomRef = firestore().collection('rooms').doc('test');
      const roomSnapshot = await roomRef.get();

      if (!roomSnapshot.exists) {
        return;
      }

      localStream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, localStream));

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
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const logout = useCallback(() => {
    try {
      // await firestore().collection('rooms').doc('test').delete();
      setRoomId(null);
      localStream.getTracks().forEach((track) => track.stop());
      peerConnection.current.close();
      setRemoteStream(null);
      setLocalStream(null);
    } catch (error) {
      // console.log(error);
    }
  }, [localStream]);

  useEffect(() => {
    const endCallListener = (data) => {
      const { callUUID, reason } = data;
      console.log(`Chamada encerrada com UUID: ${callUUID}, Motivo: ${reason}`);
      logout();
      // Faça qualquer outra ação que você deseja quando uma chamada é encerrada
    };

    const startCallListener = (data) => {
      const { handle } = data;
      console.log(`Chamada iniciada com o identificador: ${handle}`);
      // RNCallKeep.displayIncomingCall('12345', 'Fernando');
      // Faça qualquer ação que você deseja quando uma chamada é iniciada
    };

    const answerCallListener = (data) => {
      const { callUUID } = data;
      console.log(`Chamada respondia com o identificador: ${JSON.stringify(data, null, 2)}`);

      // RNCallKeep.displayIncomingCall('12345', 'Call');
      // Faça qualquer ação que você deseja quando uma chamada é iniciada
    };

    RNCallKeep.addEventListener('endCall', endCallListener);
    RNCallKeep.addEventListener('didReceiveStartCallAction', startCallListener);
    RNCallKeep.addEventListener('answerCall', answerCallListener);

    return () => {
      // Certifique-se de remover o ouvinte ao desmontar o componente
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didReceiveStartCallAction');
    };
  }, [logout]);

  return { joinCall, logout, localStream, remoteStream };
};

export default useCalle;
