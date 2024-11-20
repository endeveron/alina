const API_BASE_URL =
  process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '';
const AUTH_EMAIL =
  process.env.AUTH_EMAIL || process.env.EXPO_PUBLIC_AUTH_EMAIL || '';
const AUTH_PASSWORD =
  process.env.AUTH_PASSWORD || process.env.EXPO_PUBLIC_AUTH_PASSWORD || '';

// Fetching
const BASE_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Router
const DEFAULT_REDIRECT_URL = '/(app)';

// Store keys
const KEY_AUTH_DATA = 'auth_data';

export {
  API_BASE_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  BASE_HEADERS,
  DEFAULT_REDIRECT_URL,
  KEY_AUTH_DATA,
};
