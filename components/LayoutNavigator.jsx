import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../Screens/Home';
import Profile from '../Screens/Profile';
import Landing from '../Screens/Landing';
import BusinessRegister from '../Screens/BusinessRegister';
import BusinessStep2 from '../Screens/BusinessStep2';
import BusinessStep3 from '../Screens/BusinessStep3';
import UserRegister from '../Screens/UserRegister';
import Login from '../Screens/Login';
import Layout from './Layout';
import BusinessListScreen from '../Screens/BusinessListScreen';
import BusinessDetailScreen from '../Screens/BusinessDetailScreen';
import ForgotPassword from '../Screens/Forgetpassword';
import VerifyOtp from '../Screens/VerifyOtp';
import DialogramScreen from '../Screens/DialogramScreen';


const Stack = createNativeStackNavigator();

const withLayout =
  (Component, options = {}) =>
  props => (
    <Layout {...options}>
      <Component {...props} />
    </Layout>
  );

const LayoutNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ❌ NO Layout for Landing */}
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="BusinessRegister" component={BusinessRegister} />
      <Stack.Screen name="BusinessStep2" component={BusinessStep2} />
      <Stack.Screen name="BusinessStep3" component={BusinessStep3} />
      <Stack.Screen name="DialogramScreen" component={DialogramScreen} />


      <Stack.Screen name="UserRegister" component={UserRegister} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtp} />


      {/* ✅ Layout applied here */}
      <Stack.Screen name="Home" component={withLayout(Home)} />
      <Stack.Screen name="Profile" component={withLayout(Profile)} />
      <Stack.Screen name="BusinessListScreen" component={withLayout(BusinessListScreen)} />
      <Stack.Screen name="BusinessDetailScreen" component={withLayout(BusinessDetailScreen)} />
    </Stack.Navigator>
  );
};

export default LayoutNavigator;
