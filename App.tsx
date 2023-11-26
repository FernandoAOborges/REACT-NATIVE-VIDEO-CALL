import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { NavigationContainer } from '@react-navigation/native';

import { MainNav } from '@/navigation';

const App = () => (
  <NavigationContainer>
    <GluestackUIProvider config={config}>
      <MainNav />
    </GluestackUIProvider>
  </NavigationContainer>
);

export default App;
