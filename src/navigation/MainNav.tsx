/* eslint-disable object-curly-newline */

import * as React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { Chat, Home } from '@/pages';

const DEFAULT_HEADER_OPTIONS: NativeStackNavigationOptions = {
  headerShown: true,
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#47bef3',
  },
};

export type MainNavParamList = {
  Home: undefined;
  Chat: {
    name: string;
  };
};

export interface PageProps<T extends keyof MainNavParamList> {
  navigation: NativeStackNavigationProp<MainNavParamList, T>;
  route: RouteProp<MainNavParamList, T>;
}

const Stack = createNativeStackNavigator<MainNavParamList>();

const CONFIG_PAGES = [
  {
    id: 1,
    name: 'Home',
    component: Home,
    title: 'Home',
    options: {
      title: 'Talk With Video/Audio',
      ...DEFAULT_HEADER_OPTIONS,
    },
  },
  {
    id: 2,
    name: 'Chat',
    component: Chat,
    title: 'Chat',
    options: {
      headerShown: false,
    },
  },
];

const App = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {CONFIG_PAGES.map(({ component, id, name, title, options }) => (
        <Stack.Screen
          key={id}
          name={name as keyof MainNavParamList}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={component as any}
          options={{
            title,
            ...DEFAULT_HEADER_OPTIONS,
            ...(options || {}),
          }}
        />
      ))}
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
