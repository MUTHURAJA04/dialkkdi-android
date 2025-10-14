import { View, Text } from 'react-native';
import React from 'react';
import './global.css';
import LayoutNavigator from './components/LayoutNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '832286081721-6lpslcpq47q535evouh7dnb754ag090a.apps.googleusercontent.com', // From Google Cloud Console
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
