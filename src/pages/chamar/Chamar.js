/* eslint-disable object-curly-newline */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button, PermissionsAndroid, Text, View } from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';

import { API_URL } from '@env';
import RNCallKeep from 'react-native-callkeep';

// const options = {
//   ios: {
//     appName: 'My app name',
//   },
//   android: {
//     alertTitle: 'Permissions required',
//     alertDescription: 'This application needs to access your phone accounts',
//     cancelButton: 'Cancel',
//     okButton: 'ok',
//     imageName: 'phone_account_icon',
//     additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
//     // Required to get audio in background when using Android 11
//     foregroundService: {
//       channelId: 'com.company.my',
//       channelName: 'Foreground service for my app',
//       notificationTitle: 'My app is running on background',
//       notificationIcon: 'Path to the resource icon of the notification',
//     },
//   },
// };

// const servers = {
//   iceServers: [
//     {
//       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

const Chamar = () => {
  const [roomId, setRoomId] = useState(null);
  const peerConnection = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [serverCOnfig, setserverCOnfig] = useState({
    iceServers: [],
  });
  // const [hasAnswer, setHasAnswer] = useState(false);

  // console.log(serverCOnfig);

  useEffect(() => {
    try {
      const getLocalStream = async () => {
        const response = await fetch(API_URL);
        const iceServers = await response.json();

        setserverCOnfig((prev) => ({
          ...prev,
          iceServers,
        }));
        // peerConfiguration.iceServers = iceServers
      };

      getLocalStream();
    } catch (error) {
      // console.log(error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (peerConnection.current !== null && localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        peerConnection.current.removeStream(localStream);
        peerConnection.current.close();
      }
      peerConnection.current = null;
      setLocalStream();
      setRemoteStream();
    } catch (error) {
      // console.log(error);
    }
  }, [localStream]);

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
          facingMode: 'backwards',
        },
      });

      setLocalStream(stream);
    };

    getLocalStream();
  }, []);

  useEffect(() => {
    const endCallListener = (data) => {
      const { callUUID, reason } = data;
      console.log(`Chamada encerrada com UUID: ${callUUID}, Motivo: ${reason}`);
      logout();
      // Faça qualquer outra ação que você deseja quando uma chamada é encerrada
    };

    RNCallKeep.addEventListener('endCall', endCallListener);

    return () => {
      // Certifique-se de remover o ouvinte ao desmontar o componente
      RNCallKeep.removeEventListener('endCall');
    };
  }, [logout]);

  const createCall = async () => {
    try {
      if (serverCOnfig.iceServers.length === 0) {
        return;
      }
      peerConnection.current = new RTCPeerConnection(serverCOnfig);
      localStream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, localStream));

      RNCallKeep.startCall('12345', 'Call', '12345');

      const roomRef = firestore().collection('rooms').doc('test');
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
        if (!peerConnection.current.currentRemoteDescription && data?.answer) {
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

      // setCachedLocalPC(localPC);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <View>
      <Button title="Create Call" onPress={createCall} />
      <Button title="logout" onPress={logout} />
      <Text>{roomId}</Text>

      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={{ width: 300, height: 200 }} />
      )}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{
            width: 300,
            height: 200,
            backgroundColor: 'black', // Adicione um plano de fundo
          }}
        />
      )}

      {/* <RNCallKeep.CallerInfo name="John Doe" number="123456789" /> */}
    </View>
  );
};

export default memo(Chamar);
