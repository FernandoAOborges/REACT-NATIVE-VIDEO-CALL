import { Avatar, AvatarFallbackText, AvatarImage, HStack, Text } from '@gluestack-ui/themed';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { IUsersProps } from '../../../api/API';

const ReturnCardUsers = ({ avatar, name }: IUsersProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleNavigation = useCallback(() => {
    navigation.navigate('Chat', { name });
  }, [navigation, name]);

  return (
    <TouchableOpacity onPress={handleNavigation} activeOpacity={0.8}>
      <HStack
        bg="$blue400"
        w="90%"
        alignSelf="center"
        my="$1"
        p="$1"
        borderRadius="$md"
        elevation="$5"
        alignItems="center"
        space="md"
      >
        <Avatar bgColor="$amber600" size="lg" borderRadius="$full">
          <AvatarFallbackText>{name}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: avatar,
            }}
            alt="Image avatar"
          />
        </Avatar>
        <Text color="$white" fontWeight="bold">
          {name}
        </Text>

        <HStack justifyContent="flex-end" flex={1} space="lg">
          <FontAwesome name="chevron-right" color="white" size={20} />
        </HStack>
      </HStack>
    </TouchableOpacity>
  );
};

export default memo(ReturnCardUsers);
