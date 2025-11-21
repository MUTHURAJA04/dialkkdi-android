import React, { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import LayoutNavigator from './components/LayoutNavigator';
import { syncFcmToken } from './services/apiClient'; // Adjust path if needed
import './global.css';

GoogleSignin.configure({
  webClientId: '832286081721-6lpslcpq47q535evouh7dnb754ag090a.apps.googleusercontent.com', // From Google Cloud Console
  offlineAccess: true,
});

const App = () => {
  useEffect(() => {
    console.log("🚀 Notification Setup: useEffect mounted");

    (async () => {
      // Request notification permission (Android & iOS)
      async function requestPermission() {
        try {
          if (Platform.OS === "android") {
            console.log("📱 Android detected → requesting POST_NOTIFICATIONS permission");

            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

            console.log("🔍 Permission Result:", result);

            if (result === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("🟢 Android notification permission GRANTED");
            } else {
              console.log("🔴 Android notification permission DENIED");
              // Alert.alert("Permission denied", "Notification permission was denied. You may miss important alerts.");
            }
          } else {
            console.log("🍏 iOS detected → requesting permission from FCM");
            const authStatus = await messaging().requestPermission();

            console.log("🔍 iOS Authorization Status:", authStatus);

            const enabled =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
              console.log("🟢 iOS notification permission GRANTED");
            } else {
              console.log("🔴 iOS notification permission DECLINED");
              Alert.alert("Permission denied", "Notification permission was denied. You may miss important alerts.");
            }
          }
        } catch (err) {
          console.log("❌ Permission error:", err);
        }
      }

      // Create Android notification channel
      async function createChannel() {
        if (Platform.OS === "android") {
          console.log("📢 Creating Android notification channel...");
          try {
            const channelId = await notifee.createChannel({
              id: "default",
              name: "Default Channel",
              importance: AndroidImportance.HIGH,
            });
            console.log("🟢 Channel created successfully:", channelId);
          } catch (e) {
            console.log("❌ Channel creation failed:", e);
          }
        }
      }

      // Fetch and store FCM token
      async function getFcmToken() {
        console.log("🔄 Fetching FCM token...");
        try {
          const token = await messaging().getToken();
          console.log("🟢 FCM Token received:", token);

          await AsyncStorage.setItem("fcmToken", token);

          // Example: sync token with backend here
          await syncFcmToken(token);

          console.log("🟢 Token synced successfully!");
        } catch (err) {
          console.log("❌ FCM token error:", err);
        }
      }

      await requestPermission();
      await createChannel();
      await getFcmToken();

      // Handle incoming foreground messages
      const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
        try {
          console.log("\n========================= 📬 FOREGROUND MESSAGE RECEIVED =========================");
          console.log("📦 Full remoteMessage object:", remoteMessage);
          console.log("📩 Formatted JSON:\n", JSON.stringify(remoteMessage, null, 2));

          // Extract notification fields from DATA payload ONLY (preferred)
          const title = remoteMessage?.data?.title || "Notification";
          const body = remoteMessage?.data?.body || "You have a new message";
          const imageUrl = remoteMessage?.data?.image || null;

          console.log("🔍 Extracted notification fields from DATA payload only...");
          console.log("📝 Extracted Title:", title);
          console.log("📝 Extracted Body:", body);
          console.log("🖼 Raw Image URL from DATA payload:", imageUrl);

          // Clean notification object to prevent Notifee conflicts
          if (remoteMessage.notification) {
            if (remoteMessage.notification.android) {
              if (remoteMessage.notification.android.style) {
                delete remoteMessage.notification.android.style;
                console.log("🧹 Removed old notification.android.style");
              }
              if (remoteMessage.notification.android.imageUrl) {
                delete remoteMessage.notification.android.imageUrl;
                console.log("🧹 Removed old notification.android.imageUrl");
              }
            }
            // Also remove notification object itself to be safe
            delete remoteMessage.notification;
            console.log("🧹 Removed entire remoteMessage.notification object");
          }

          // Prepare style object only if imageUrl exists
          const styleObj = imageUrl
            ? {
                type: 2, // BIG_PICTURE style
                picture: imageUrl,
              }
            : undefined;

          console.log("🔢 DEBUG style object to send:", styleObj);

          try {
            console.log("🔔 Displaying notification via Notifee...");
            await notifee.displayNotification({
              title,
              body,
              android: {
                channelId: "default",
                pressAction: { id: "default" },
                style: styleObj,
              },
            });
            console.log("🟢 Notification displayed successfully!");
          } catch (error) {
            console.log("❌ Notifee displayNotification error:", error);
          }

          console.log("=================================================================================\n");
        } catch (err) {
          console.log("❌ Error handling foreground message:", err);
        }
      });

      // Clean up subscriptions on unmount
      return () => {
        console.log("🧹 Cleaning up notification listeners...");
        unsubscribeOnMessage();
      };
    })();

  }, []);

  return (
    <NavigationContainer>
      <LayoutNavigator />
    </NavigationContainer>
  );
};

export default App;
