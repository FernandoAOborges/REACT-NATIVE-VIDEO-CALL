import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
} from 'react-native-webrtc';
import { API_URL } from '@env';
import RNCallKeep from 'react-native-callkeep';
import firestore from '@react-native-firebase/firestore';

const useChamada = ({ name }) => {
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

  const logout = useCallback(() => {
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
          facingMode: 'user',
        },
      });

      setLocalStream(stream);
    };

    getLocalStream();
  }, []);

  const createCall = async () => {
    try {
      if (serverCOnfig.iceServers.length === 0) {
        return;
      }
      peerConnection.current = new RTCPeerConnection(serverCOnfig);
      localStream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, localStream));

      RNCallKeep.startCall(name, 'Call', name);

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

  return { createCall, logout, localStream, remoteStream };
};

export default useChamada;
