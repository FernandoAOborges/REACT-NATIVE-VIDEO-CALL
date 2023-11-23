import { View, Button } from 'react-native';
import React from 'react';

import { PageProps } from '../../navigation/MainNav';

interface IHomeprops {
  navigation: PageProps<'Home'>['navigation'];
}

const Home = ({ navigation }: IHomeprops) => (
  <View
    style={{
      flex: 1,
      gap: 100,
    }}
  >
    <Button title="CHAMAR" onPress={() => navigation.navigate('Chamar')} />
    <Button title="RESPONDER" onPress={() => navigation.navigate('Responder')} />
  </View>
);

export default Home;
