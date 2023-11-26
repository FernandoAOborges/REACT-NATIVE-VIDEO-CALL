import { View } from '@gluestack-ui/themed';
import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

import { useAppDispatch, useCaller } from '@/hooks';
import { IUsersProps } from '@/types/Types';

import ReturnHeader from './components/ReturnHeader';
import { setCallType } from '@/redux/CallerCalleeSlice';

interface IChatProps {
  route: {
    params: {
      name: IUsersProps['name'];
    };
  };
}

const Chat = ({ route }: IChatProps) => {
  const { name } = route.params;

  const dispatch = useAppDispatch();

  const [messages, setMessages] = useState([] as IMessage[]);

  const { handleConnection } = useCaller({ name });

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

  useLayoutEffect(() => {
    dispatch(setCallType(null));
  }, [dispatch]);

  return (
    <View flex={1}>
      <ReturnHeader name={name} onPress={handleConnection} />
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
