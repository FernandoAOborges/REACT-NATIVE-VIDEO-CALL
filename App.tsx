import React from 'react';
import { GluestackUIProvider, Text } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import MainNav from './src/navigation/MainNav';

const App = () => (
  <GluestackUIProvider config={config}>
    <MainNav />
  </GluestackUIProvider>
);

export default App;
