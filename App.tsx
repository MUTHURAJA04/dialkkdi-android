import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import LayoutNavigator from './components/LayoutNavigator';
import { syncFcmToken } from './services/apiClient'; // Adjust path if needed
import './global.css';

GoogleSignin.configure({
  webClientId: '832286081721-6lpslcpq47q535evouh7dnb754ag090a.apps.googleusercontent.com', // From Google Cloud Console
  offlineAccess: true,
});

const App = () => {
  useEffect(() => {
    async function requestPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('User declined notification permissions');
      }
    }

    requestPermission();

    // Get initial token, save and sync
messaging()
  .getToken()
  .then(async (token) => {
    console.log('🟢 FCM Device Token received:', token);
    await AsyncStorage.setItem('fcmToken', token);
    const storedToken = await AsyncStorage.getItem('fcmToken');
    console.log('🟢 FCM Token saved to AsyncStorage:', storedToken);
    await syncFcmToken();
  });


    // Listen for token refresh and update backend
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM Token refreshed:', newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      await syncFcmToken();
    });

    // Listen to foreground messages and show alert
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || ''
      );
      console.log('Foreground message:', remoteMessage);
    });

    // Listen for when app is opened from background due to notification
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage);
      // Handle navigation or actions here if needed
    });

    // Check if app was opened from quit state by a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          // Handle navigation or actions here if needed
        }
      });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  return (
    <NavigationContainer>
      <LayoutNavigator />
    </NavigationContainer>
  );
};

export default App;
