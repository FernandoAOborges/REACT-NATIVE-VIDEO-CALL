import React, { memo } from 'react';
import { HStack, Text, VStack } from '@gluestack-ui/themed';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

interface IReturnHeaderProps {
  name: string;
  onPress: () => void;
}

const ReturnHeader = ({ name, onPress }: IReturnHeaderProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <HStack bg="#47bef3" p="$4" elevation="$4" alignItems="center" justifyContent="space-between">
      <FontAwesome
        name="chevron-left"
        color="white"
        size={20}
        onPress={() => {
          navigation.goBack();
        }}
      />
      <Text textAlign="center" color="$white" ellipsizeMode="tail" numberOfLines={1}>
        {name}
      </Text>
      <VStack bg="$white" p="$1" borderRadius="$lg" elevation="$4">
        <FontAwesome
          name="phone"
          color="green"
          size={20}
          onPress={() => {
            onPress();
          }}
        />
      </VStack>
    </HStack>
  );
};

export default memo(ReturnHeader);
