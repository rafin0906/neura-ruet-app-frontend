/**
 * apiConfig.js
 * Central place for API-related configuration.
 *
 * NOTE: React Native CLI does not include .env support by default.
 * To change URLs, update the constants below (or wire your own env system).
 */

// Dev base URL notes:
// - Android emulator: use 'http://10.0.2.2:8000'
// - Physical Android device on same Wi‑Fi: use your PC LAN IP, e.g. 'http://192.168.0.25:8000'
// - Physical Android device over USB (no Wi‑Fi): run `adb reverse tcp:8000 tcp:8000` and use 'http://127.0.0.1:8000'
// If your backend is mounted under a prefix (e.g. /api/v1), include it here.
const DEV_BASE_URL = 'http://127.0.0.1:8000';

// Your production/live server base URL.
const PROD_BASE_URL = 'https://<YOUR_LIVE_DOMAIN_OR_IP>';

// React Native provides __DEV__ globally.
export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

// Request timeout in milliseconds.
// Keep it reasonable so the UI can recover from bad networks.
export const REQUEST_TIMEOUT_MS = 15000;

// AsyncStorage key where you store your JWT.
// Use the same key when you save token after login.
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

// Tracks what kind of token is currently stored under AUTH_TOKEN_STORAGE_KEY.
// Values: 'setup' | 'access'
export const AUTH_TOKEN_KIND_STORAGE_KEY = 'auth_token_kind';

// Current signed-in role. Values: 'student' | 'teacher' | 'cr'
export const AUTH_ROLE_STORAGE_KEY = 'auth_role';

// Cache the signed-in user's display name for UI (e.g. drawer user card).
export const AUTH_FULL_NAME_STORAGE_KEY = 'auth_full_name';

// Refresh flow (backend requires refresh token + refresh id + expired access token)
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
export const REFRESH_TOKEN_ID_STORAGE_KEY = 'refresh_token_id';

// Store the last known access token even if AUTH_TOKEN_STORAGE_KEY is cleared
// (needed because backend expects X-Access-Token on refresh).
export const LAST_ACCESS_TOKEN_STORAGE_KEY = 'last_access_token';
