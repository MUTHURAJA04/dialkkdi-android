import { View, Text } from 'react-native';
import React from 'react';
import './global.css';
import Layout from './components/Layout';
import LayoutNavigator from './components/LayoutNavigator';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  return (
    <NavigationContainer>
      <LayoutNavigator />
    </NavigationContainer>
  );
};

export default App;
