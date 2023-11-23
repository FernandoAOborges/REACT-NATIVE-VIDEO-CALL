/* eslint-disable object-curly-newline */

import * as React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { Chamar, Home, Responder } from '../pages';

export type MainNavParamList = {
  Home: undefined;
  Chamar: undefined;
  Responder: undefined;
};

export interface PageProps<T extends keyof MainNavParamList> {
  navigation: NativeStackNavigationProp<MainNavParamList, T>;
  route: RouteProp<MainNavParamList, T>;
}

const Stack = createNativeStackNavigator<MainNavParamList>();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Chamar" component={Chamar} />
      <Stack.Screen name="Responder" component={Responder} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
