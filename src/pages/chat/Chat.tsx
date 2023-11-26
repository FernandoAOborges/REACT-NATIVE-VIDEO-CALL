import { View } from '@gluestack-ui/themed';
import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

import { useAppSelector, useCaller } from '@/hooks';
import { IUsersProps } from '@/types/Types';
import { AuthenticationSelector } from '@/redux/AuthenticationSlice';

import ReturnHeader from './components/ReturnHeader';

interface IChatProps {
  route: {
    params: {
      dataUserRequest: IUsersProps;
    };
  };
}

const Chat = ({ route }: IChatProps) => {
  const { dataUserRequest } = route.params;

  const [messages, setMessages] = useState([] as IMessage[]);

  const { user } = useAppSelector(AuthenticationSelector);

  const { handleConnection } = useCaller({ dataUserRequest, user });

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
      <ReturnHeader name={dataUserRequest?.name} onPress={handleConnection} />
      <GiftedChat
        messages={messages}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSend={(value: any) => onSend(value)}
        user={{
          _id: 1,
        }}
      />
      {/* <ReturnAudioVideo /> */}
    </View>
  );
};

export default Chat;
