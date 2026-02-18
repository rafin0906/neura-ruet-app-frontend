/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

import { displayRemoteMessageNotification } from './src/utils/notifications/notifeeNotifications';
import { navigateToNotifications } from './src/components/navigation/navigationRef';

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    // For notification payloads: Android system UI handles it automatically.
    // For data-only payloads: show a local notification so users see it.
    if (!remoteMessage?.notification) {
        try {
            await displayRemoteMessageNotification(remoteMessage);
        } catch {
            // ignore
        }
    }
});

// Notifee requires a background event handler to be set.
// This prevents the "no background event handler has been set" warning.
notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== EventType.PRESS) return;

    const screen = detail?.notification?.data?.screen;
    if (screen === 'Notifications') {
        // Safe even if navigation isn't ready yet; we queue and flush later.
        navigateToNotifications();
    }
});

AppRegistry.registerComponent(appName, () => App);
