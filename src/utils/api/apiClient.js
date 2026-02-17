/**
 * apiClient.js
 * Axios instance with:
 * - Environment-based baseURL
 * - Timeout
 * - Automatic JWT attachment from AsyncStorage
 * - Global 401 handling
 * - Consistent error formatting
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    BASE_URL,
    REQUEST_TIMEOUT_MS,
    AUTH_TOKEN_STORAGE_KEY,
    AUTH_TOKEN_KIND_STORAGE_KEY,
    AUTH_ROLE_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_ID_STORAGE_KEY,
    LAST_ACCESS_TOKEN_STORAGE_KEY,
} from './apiConfig';
import { formatApiError } from './errorHandler';

const API = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

function getRefreshEndpoint(role) {
    if (role === 'teacher') return '/api/v1/teachers/refresh';
    if (role === 'cr') return '/api/v1/crs/refresh';
    return '/api/v1/students/refresh';
}

let refreshPromise = null;

async function refreshAccessToken() {
    const pairs = await AsyncStorage.multiGet([
        AUTH_ROLE_STORAGE_KEY,
        REFRESH_TOKEN_STORAGE_KEY,
        REFRESH_TOKEN_ID_STORAGE_KEY,
        LAST_ACCESS_TOKEN_STORAGE_KEY,
    ]);

    const role = pairs[0]?.[1];
    const refreshToken = pairs[1]?.[1];
    const refreshTokenId = pairs[2]?.[1];
    const lastAccessToken = pairs[3]?.[1];

    if (!role || !refreshToken || !refreshTokenId || !lastAccessToken) {
        throw new Error('Missing refresh credentials');
    }

    const endpoint = getRefreshEndpoint(String(role).trim().toLowerCase());
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
        [AUTH_ROLE_STORAGE_KEY, String(role).trim().toLowerCase()],
    ];
    if (typeof newRefreshToken === 'string' && newRefreshToken.length > 0) {
        toStore.push([REFRESH_TOKEN_STORAGE_KEY, newRefreshToken]);
    }
    if (typeof newRefreshTokenId === 'string' && newRefreshTokenId.length > 0) {
        toStore.push([REFRESH_TOKEN_ID_STORAGE_KEY, newRefreshTokenId]);
    }
    await AsyncStorage.multiSet(toStore);

    API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    return newAccessToken;
}

// REQUEST INTERCEPTOR: attach JWT token if it exists.
API.interceptors.request.use(
    async (config) => {
        try {
            if (config?.skipAuth === true) {
                return config;
            }

            const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

            if (token) {
                // Ensure headers object exists.
                config.headers = config.headers ?? {};
                // Don't overwrite Authorization if the request already set one
                // (e.g. refresh endpoint uses refresh token in Authorization).
                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            return config;
        } catch (e) {
            // If AsyncStorage fails, proceed without token (don't block requests).
            return config;
        }
    },
    (error) => Promise.reject(formatApiError(error))
);

// RESPONSE INTERCEPTOR: handle 401 globally (expired/invalid token).
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;

        const originalRequest = error?.config;

        if (status === 401) {
            // Never attempt to refresh a refresh request.
            if (originalRequest?.__isRefreshRequest) {
                try {
                    await AsyncStorage.multiRemove([
                        AUTH_TOKEN_STORAGE_KEY,
                        AUTH_TOKEN_KIND_STORAGE_KEY,
                        AUTH_ROLE_STORAGE_KEY,
                        REFRESH_TOKEN_STORAGE_KEY,
                        REFRESH_TOKEN_ID_STORAGE_KEY,
                        LAST_ACCESS_TOKEN_STORAGE_KEY,
                    ]);
                } catch (e) {
                    // ignore
                }
                return Promise.reject(formatApiError(error));
            }

            // If we already retried once, do not loop forever.
            if (originalRequest?._retry) {
                try {
                    await AsyncStorage.multiRemove([
                        AUTH_TOKEN_STORAGE_KEY,
                        AUTH_TOKEN_KIND_STORAGE_KEY,
                    ]);
                } catch (e) {
                    // ignore
                }
                return Promise.reject(formatApiError(error));
            }

            // Only refresh for normal access-token auth flows.
            // Setup token flows should not attempt refresh here.
            let tokenKind = null;
            try {
                tokenKind = await AsyncStorage.getItem(AUTH_TOKEN_KIND_STORAGE_KEY);
            } catch {
                tokenKind = null;
            }

            if (tokenKind !== 'access') {
                try {
                    await AsyncStorage.multiRemove([
                        AUTH_TOKEN_STORAGE_KEY,
                        AUTH_TOKEN_KIND_STORAGE_KEY,
                    ]);
                } catch (e) {
                    // ignore
                }
                return Promise.reject(formatApiError(error));
            }

            // Single-flight refresh: if multiple requests fail with 401,
            // refresh once and replay them with the new token.
            try {
                originalRequest._retry = true;

                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => {
                        refreshPromise = null;
                    });
                }

                const newAccessToken = await refreshPromise;
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (e) {
                try {
                    await AsyncStorage.multiRemove([
                        AUTH_TOKEN_STORAGE_KEY,
                        AUTH_TOKEN_KIND_STORAGE_KEY,
                        AUTH_ROLE_STORAGE_KEY,
                        REFRESH_TOKEN_STORAGE_KEY,
                        REFRESH_TOKEN_ID_STORAGE_KEY,
                        LAST_ACCESS_TOKEN_STORAGE_KEY,
                    ]);
                } catch (e2) {
                    // ignore
                }
                return Promise.reject(formatApiError(error));
            }
        }

        return Promise.reject(formatApiError(error));
    }
);

export default API;
