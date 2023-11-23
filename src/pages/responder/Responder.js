/* eslint-disable object-curly-newline */
import React, { useState, useEffect, useRef, memo } from 'react';
import { Button, View, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  RTCView,
} from 'react-native-webrtc';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const Responder = () => {
  const [roomId, setRoomId] = useState('test');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);

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

  const logout = async () => {
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
  };

  return (
    <View>
      <TextInput value={roomId} onChangeText={(text) => setRoomId(text)} placeholder="Room ID" />
      <Button title="logout" onPress={logout} />
      <Button title="Join Call" onPress={joinCall} />
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
    </View>
  );
};

export default memo(Responder);
