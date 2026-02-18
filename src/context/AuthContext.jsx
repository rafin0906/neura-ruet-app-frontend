import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import {
    getMessaging,
    getInitialNotification,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

import notifee, { EventType as NotifeeEventType } from '@notifee/react-native';

import { displayRemoteMessageNotification, ensureDefaultChannel } from '../utils/notifications/notifeeNotifications';
import { navigateToNotifications } from '../components/navigation/navigationRef';

import API from '../utils/api/apiClient';
import {
    AUTH_ROLE_STORAGE_KEY,
    AUTH_FULL_NAME_STORAGE_KEY,
    AUTH_TOKEN_KIND_STORAGE_KEY,
    AUTH_TOKEN_STORAGE_KEY,
    LAST_ACCESS_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_ID_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
} from '../utils/api/apiConfig';

const AuthContext = createContext(null);

const STORAGE_KEYS = [
    AUTH_TOKEN_STORAGE_KEY,
    AUTH_TOKEN_KIND_STORAGE_KEY,
    AUTH_ROLE_STORAGE_KEY,
    AUTH_FULL_NAME_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_ID_STORAGE_KEY,
    LAST_ACCESS_TOKEN_STORAGE_KEY,
];

function setApiAuthorization(accessToken) {
    if (typeof accessToken === 'string' && accessToken.length > 0) {
        API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
        delete API.defaults.headers.common.Authorization;
    }
}

function getRefreshEndpoint(role) {
    if (role === 'teacher') return '/api/v1/teachers/refresh';
    if (role === 'cr') return '/api/v1/crs/refresh';
    return '/api/v1/students/refresh';
}

function getProfileMeEndpoint(role) {
    if (role === 'teacher') return '/api/v1/teachers/profile-setup/me';
    if (role === 'cr') return '/api/v1/crs/profile-setup/me';
    return '/api/v1/students/profile-setup/me';
}

export const AuthProvider = ({ children }) => {
    const [status, setStatus] = useState('loading'); // loading | unauthenticated | setup | authenticated
    const [role, setRole] = useState(null);
    const [profile, setProfile] = useState(null); // { fullName: string }

    const normalizeRole = useCallback((value) => {
        if (typeof value !== 'string') return null;
        const v = value.trim().toLowerCase();
        if (v === 'student' || v === 'teacher' || v === 'cr') return v;
        return null;
    }, []);

    const clearAllAuth = useCallback(async () => {
        try {
            await AsyncStorage.multiRemove(STORAGE_KEYS);
        } catch {
            // ignore
        }
        setApiAuthorization(null);
        setRole(null);
        setProfile(null);
        setStatus('unauthenticated');
    }, []);

    const setAuthenticated = useCallback(({ role: nextRole, accessToken }) => {
        setApiAuthorization(accessToken);
        setRole(nextRole || null);
        setStatus('authenticated');
    }, []);

    const refreshProfile = useCallback(
        async (roleOverride) => {
            const effectiveRole = roleOverride || role;
            if (!effectiveRole) return null;

            const endpoint = getProfileMeEndpoint(effectiveRole);
            try {
                const response = await API.get(endpoint);
                const fullName = typeof response?.data?.full_name === 'string' ? response.data.full_name : '';
                const trimmed = fullName.trim();

                setProfile({ fullName: trimmed });
                await AsyncStorage.setItem(AUTH_FULL_NAME_STORAGE_KEY, trimmed);
                return trimmed;
            } catch {
                // Fall back to cached name if available.
                try {
                    const cached = await AsyncStorage.getItem(AUTH_FULL_NAME_STORAGE_KEY);
                    if (typeof cached === 'string' && cached.trim().length > 0) {
                        const trimmed = cached.trim();
                        setProfile({ fullName: trimmed });
                        return trimmed;
                    }
                } catch {
                    // ignore
                }
                return null;
            }
        },
        [role]
    );

    const refreshAccessToken = useCallback(async (storedRole) => {
        const endpoint = getRefreshEndpoint(storedRole);

        const pairs = await AsyncStorage.multiGet([
            REFRESH_TOKEN_STORAGE_KEY,
            REFRESH_TOKEN_ID_STORAGE_KEY,
            LAST_ACCESS_TOKEN_STORAGE_KEY,
        ]);

        const refreshToken = pairs[0]?.[1];
        const refreshTokenId = pairs[1]?.[1];
        const lastAccessToken = pairs[2]?.[1];

        if (!refreshToken || !refreshTokenId || !lastAccessToken) {
            throw new Error('Missing refresh credentials');
        }

        const response = await API.post(
            endpoint,
            {},
            {
                skipAuth: true,
                __isRefreshRequest: true,
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    'X-Refresh-Id': refreshTokenId,
                    'X-Access-Token': lastAccessToken,
                },
            }
        );

        const newAccessToken = response?.data?.access_token;
        const newRefreshToken = response?.data?.refresh_token;
        const newRefreshTokenId = response?.data?.refresh_token_id;

        if (!newAccessToken) {
            throw new Error('Refresh did not return access token');
        }

        const toStore = [
            [AUTH_TOKEN_STORAGE_KEY, newAccessToken],
            [LAST_ACCESS_TOKEN_STORAGE_KEY, newAccessToken],
            [AUTH_TOKEN_KIND_STORAGE_KEY, 'access'],
            [AUTH_ROLE_STORAGE_KEY, storedRole],
        ];

        if (typeof newRefreshToken === 'string' && newRefreshToken.length > 0) {
            toStore.push([REFRESH_TOKEN_STORAGE_KEY, newRefreshToken]);
        }
        if (typeof newRefreshTokenId === 'string' && newRefreshTokenId.length > 0) {
            toStore.push([REFRESH_TOKEN_ID_STORAGE_KEY, newRefreshTokenId]);
        }

        await AsyncStorage.multiSet(toStore);

        setAuthenticated({ role: storedRole, accessToken: newAccessToken });
        return newAccessToken;
    }, [setAuthenticated]);

    const bootstrapAuth = useCallback(async () => {
        try {
            const pairs = await AsyncStorage.multiGet([
                AUTH_TOKEN_STORAGE_KEY,
                AUTH_TOKEN_KIND_STORAGE_KEY,
                AUTH_ROLE_STORAGE_KEY,
            ]);

            const token = pairs[0]?.[1];
            const tokenKind = pairs[1]?.[1];
            const storedRole = normalizeRole(pairs[2]?.[1]);

            if (storedRole) setRole(storedRole);

            // If we have a token but no valid role, we can't route correctly.
            if (token && !storedRole) {
                await clearAllAuth();
                return;
            }

            // If we already have an access token, still try to refresh on app launch.
            // This avoids the "credentials become invalid after 30 mins" issue
            // when the app is resumed/kept alive with an expired token.
            if (token && tokenKind === 'access' && storedRole) {
                try {
                    await refreshAccessToken(storedRole);
                    return;
                } catch {
                    // If refresh fails (offline/missing refresh creds), fall back to stored token.
                    setAuthenticated({ role: storedRole, accessToken: token });
                    return;
                }
            }

            if (token && tokenKind === 'setup' && storedRole) {
                setStatus('setup');
                return;
            }

            // Try refresh only if we know the role.
            if (storedRole) {
                await refreshAccessToken(storedRole);
                return;
            }

            setStatus('unauthenticated');
        } catch {
            await clearAllAuth();
        }
    }, [clearAllAuth, normalizeRole, refreshAccessToken, setAuthenticated]);

    useEffect(() => {
        bootstrapAuth();
    }, [bootstrapAuth]);

    // Android push notifications: request permission, register token, and handle foreground messages.
    useEffect(() => {
        if (Platform.OS !== 'android') return;
        if (status !== 'authenticated') return;

        let unsubscribeOnMessage = null;
        let unsubscribeOnTokenRefresh = null;
        let unsubscribeOnNotificationOpened = null;
        let unsubscribeNotifeeForeground = null;

        const messagingInstance = getMessaging();

        const ensurePermission = async () => {
            // Android 13+ requires POST_NOTIFICATIONS runtime permission.
            if (Platform.Version >= 33) {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } catch {
                    return false;
                }
            }
            return true;
        };

        const registerToken = async (token) => {
            if (typeof token !== 'string' || token.trim().length === 0) return;
            try {
                await API.post('/api/v1/push/device-token', { token: token.trim() });
            } catch {
                // ignore (app can continue without push registration)
            }
        };

        const initPush = async () => {
            const permitted = await ensurePermission();
            if (!permitted) return;

            try {
                await ensureDefaultChannel();
            } catch {
                // ignore
            }

            try {
                await registerDeviceForRemoteMessages(messagingInstance);
            } catch {
                // ignore
            }

            try {
                const token = await getToken(messagingInstance);
                await registerToken(token);
            } catch {
                // ignore
            }

            // Navigate when user taps a system notification (background -> foreground).
            try {
                unsubscribeOnNotificationOpened = onNotificationOpenedApp(messagingInstance, () => {
                    navigateToNotifications();
                });
            } catch {
                // ignore
            }

            // Navigate when app is cold-started by tapping a system notification.
            try {
                const initial = await getInitialNotification(messagingInstance);
                if (initial) {
                    navigateToNotifications();
                }
            } catch {
                // ignore
            }

            // Navigate when user taps a Notifee local notification (foreground).
            try {
                unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type }) => {
                    if (type === NotifeeEventType.PRESS) {
                        navigateToNotifications();
                    }
                });
            } catch {
                // ignore
            }

            // Navigate when app is cold-started by tapping a Notifee notification.
            try {
                const initialNotifee = await notifee.getInitialNotification();
                if (initialNotifee) {
                    navigateToNotifications();
                }
            } catch {
                // ignore
            }

            unsubscribeOnTokenRefresh = onTokenRefresh(messagingInstance, async (token) => {
                await registerToken(token);
            });

            unsubscribeOnMessage = onMessage(messagingInstance, async (remoteMessage) => {
                try {
                    // FCM does not show notification UI while app is in the foreground.
                    // Display a local notification so users still see it.
                    await displayRemoteMessageNotification(remoteMessage);
                } catch {
                    // ignore
                }
            });
        };

        initPush();

        return () => {
            if (typeof unsubscribeOnMessage === 'function') unsubscribeOnMessage();
            if (typeof unsubscribeOnTokenRefresh === 'function') unsubscribeOnTokenRefresh();
            if (typeof unsubscribeOnNotificationOpened === 'function') unsubscribeOnNotificationOpened();
            if (typeof unsubscribeNotifeeForeground === 'function') unsubscribeNotifeeForeground();
        };
    }, [status]);

    // Keep the cached profile in sync after auth/refresh.
    useEffect(() => {
        if (status === 'authenticated' && role) {
            refreshProfile(role);
            return;
        }

        if (status !== 'authenticated') {
            setProfile(null);
        }
    }, [status, role, refreshProfile]);

    const value = useMemo(
        () => ({
            status,
            role,
            profile,
            bootstrapAuth,
            refreshAccessToken,
            refreshProfile,
            clearAllAuth,
            setAuthenticated,
        }),
        [status, role, profile, bootstrapAuth, refreshAccessToken, refreshProfile, clearAllAuth, setAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
};
