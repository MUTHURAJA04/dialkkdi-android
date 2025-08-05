import { View, Text } from 'react-native';
import React from 'react';
import './global.css';
import LayoutNavigator from './components/LayoutNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '533114410878-g2i2uuqdrbsbf9phv8teepaf5smgc14p.apps.googleusercontent.com', // From Google Cloud Console
  offlineAccess: true,
});

const App = () => {
  return (
    <NavigationContainer>
      <LayoutNavigator />
    </NavigationContainer>
  );
};

export default App;
