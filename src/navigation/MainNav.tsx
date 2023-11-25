/* eslint-disable object-curly-newline */

import * as React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { Chamar, Chat, Home, Responder } from '../pages';

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
  Chamar: undefined;
  Responder: undefined;
  Chat: {
    name: string;
  };
};

export interface PageProps<T extends keyof MainNavParamList> {
  navigation: NativeStackNavigationProp<MainNavParamList, T>;
  route: RouteProp<MainNavParamList, T>;
}

const Stack = createNativeStackNavigator<MainNavParamList>();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Talk With Video/Audio',
          ...DEFAULT_HEADER_OPTIONS,
        }}
      />
      <Stack.Screen name="Chamar" component={Chamar} />
      <Stack.Screen name="Responder" component={Responder} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
