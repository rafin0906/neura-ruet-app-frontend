import React, { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import StackNavigator from './src/components/navigation/StackNavigator';

import notifee, { EventType } from '@notifee/react-native';
import {
  getMessaging,
  getInitialNotification,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import { navigateToNotifications } from './src/components/navigation/navigationRef';



export default function App() {
  useEffect(() => {
    const init = async () => {
      // Place any startup tasks here (e.g., preload, restore auth state, etc.)
    };

    init().finally(async () => {
      try {
        await new Promise((resolve) => {
          if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => resolve());
            return;
          }

          // Fallbacks for environments without requestIdleCallback
          if (typeof setImmediate === 'function') {
            setImmediate(resolve);
          } else {
            setTimeout(resolve, 0);
          }
        });
      } catch (e) {
        // ignore
      }

      try {
        if (BootSplash.isVisible()) {
          await BootSplash.hide({ fade: true });
        }
      } catch (e) {
        // ignore
      }
    });
  }, []);

  // Navigate to Notifications screen when user taps a notification.
  useEffect(() => {
    const messagingInstance = getMessaging();

    const unsubscribeOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      if (remoteMessage?.data?.screen === 'Notifications') {
        navigateToNotifications();
      }
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const screen = detail?.notification?.data?.screen;
        if (screen === 'Notifications') {
          navigateToNotifications();
        }
      }
    });

    (async () => {
      try {
        const initialFcm = await getInitialNotification(messagingInstance);
        if (initialFcm && initialFcm?.data?.screen === 'Notifications') {
          navigateToNotifications();
          return;
        }
      } catch {
        // ignore
      }

      try {
        const initialNotifee = await notifee.getInitialNotification();
        const screen = initialNotifee?.notification?.data?.screen;
        if (initialNotifee && screen === 'Notifications') {
          navigateToNotifications();
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      if (typeof unsubscribeOpened === 'function') unsubscribeOpened();
      if (typeof unsubscribeNotifee === 'function') unsubscribeNotifee();
    };
  }, []);

  return (
    <StackNavigator />
  );
}