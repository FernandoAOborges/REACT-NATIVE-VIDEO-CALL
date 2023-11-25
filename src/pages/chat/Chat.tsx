import { View } from '@gluestack-ui/themed';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { IUsersProps } from '../../api/API';
import { useCall } from '../../hooks';

import ReturnHeader from './components/ReturnHeader';

interface IChatProps {
  route: {
    params: {
      name: IUsersProps['name'];
    };
  };
}

const Chat = ({ route, navigation }: IChatProps) => {
  const { name } = route.params;

  const [messages, setMessages] = useState([]);

  const { createCall } = useCall({ name });

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Ok',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://picsum.photos/id/10/200/200',
        },
      },
      {
        _id: 2,
        text: 'I will call you',
        createdAt: new Date(),
        user: {
          _id: 1,
          name: 'React Native',
          avatar: 'https://picsum.photos/id/10/200/200',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messagesUsers = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messagesUsers));
  }, []);

  return (
    <View flex={1}>
      <ReturnHeader name={name} onPress={() => createCall()} />
      <GiftedChat
        messages={messages}
        onSend={(value) => onSend(value)}
        user={{
          _id: 1,
        }}
      />
      {/* <ReturnAudioVideo /> */}
      <Button title="dsadasd" onPress={() => navigation.navigate('Chamar')} />
    </View>
  );
};

export default Chat;
