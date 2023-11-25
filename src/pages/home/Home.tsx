import { FlatList, PermissionsAndroid } from 'react-native';
import React, { useCallback } from 'react';
import RNCallKeep from 'react-native-callkeep';
import { View } from '@gluestack-ui/themed';

import { IUsersProps, USERS } from '@/api/API';
import { useCalle } from '@/hooks';

import ReturnCardUsers from './components/ReturnCardUsers';

RNCallKeep.setup({
  ios: {
    appName: 'My App Name',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'OK',
    additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS],
  },
});

const Home = () => {
  useCalle();
  const keyExtractor = useCallback((item: IUsersProps) => String(item.id), []);

  const RenderItem = useCallback(
    ({ item }: { item: IUsersProps }) => <ReturnCardUsers {...item} />,
    [],
  );

  return (
    <View flex={1}>
      <FlatList data={USERS} keyExtractor={keyExtractor} renderItem={RenderItem} />
    </View>
  );
};

export default Home;
