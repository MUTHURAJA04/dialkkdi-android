import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
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
import TalkofTown from '../Screens/TalkofTown';


const Stack = createNativeStackNavigator();

// Auth guard HOC: ensures user is logged in to access a screen
const withAuthGuard = Component => props => {
  const { navigation } = props;
  const [ready, setReady] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const check = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (!userData && !cancelled) {
            setAllowed(false);
            setReady(true);
            Alert.alert(
              'Login required',
              'Please login to continue',
              [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] }),
                },
              ],
              { cancelable: false }
            );
          } else if (!cancelled) {
            setAllowed(true);
            setReady(true);
          }
        } catch (e) {
          if (!cancelled) {
            setAllowed(false);
            setReady(true);
            navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
          }
        }
      };
      check();
      return () => {
        cancelled = true;
      };
    }, [navigation])
  );

  if (!ready || !allowed) return null;
  return <Component {...props} />;
};

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
      <Stack.Screen name="BusinessRegister" component={withAuthGuard(BusinessRegister)} />
      <Stack.Screen name="BusinessStep2" component={withAuthGuard(BusinessStep2)} />
      <Stack.Screen name="BusinessStep3" component={withAuthGuard(BusinessStep3)} />
      <Stack.Screen name="DialogramScreen" component={withAuthGuard(DialogramScreen)} />
      <Stack.Screen name="TalkofTown" component={withAuthGuard(TalkofTown)} />

      <Stack.Screen name="Profile" component={withAuthGuard(Profile)} />
      <Stack.Screen name="UserRegister" component={UserRegister} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtp} />


      {/* ✅ Layout + AuthGuard applied here */}
      <Stack.Screen name="Home" component={withAuthGuard(withLayout(Home))} />

      <Stack.Screen name="BusinessListScreen" component={withAuthGuard(withLayout(BusinessListScreen))} />
      <Stack.Screen name="BusinessDetailScreen" component={withAuthGuard(withLayout(BusinessDetailScreen))} />
    </Stack.Navigator>
  );
};

export default LayoutNavigator;
