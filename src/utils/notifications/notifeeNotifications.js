import notifee, { AndroidImportance } from '@notifee/react-native';

export async function ensureDefaultChannel() {
    // Create (or return existing) default channel for Android notifications.
    // Using a stable channel id keeps behavior consistent across app restarts.
    return await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
    });
}

export async function displayRemoteMessageNotification(remoteMessage) {
    const data = remoteMessage?.data || {};

    const title =
        remoteMessage?.notification?.title ||
        data?.notice_title ||
        'Notification';

    const body =
        remoteMessage?.notification?.body ||
        (data?.sender_name && data?.notice_description
            ? `${data.sender_name}: ${data.notice_description}`
            : data?.notice_description ||
            '');

    const channelId = await ensureDefaultChannel();

    await notifee.displayNotification({
        title,
        body,
        data: {
            ...data,
            screen: data?.screen || 'Notifications',
        },
        android: {
            channelId,
            pressAction: {
                id: 'default',
            },
        },
    });
}
