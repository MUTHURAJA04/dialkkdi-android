/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';


// Firebase + Notifee background handler must be registered at top-level
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// Handle background & quit state messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 Background message received:', remoteMessage);

  // Display a native notification using Notifee
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
    body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new message',
    android: {
      channelId: 'default',
      pressAction: { id: 'default' },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
