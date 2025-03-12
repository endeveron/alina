const API_BASE_URL =
  process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '';
const AUTH_NAME =
  process.env.AUTH_NAME || process.env.EXPO_PUBLIC_AUTH_NAME || '';
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

const LANG_MAP: { [key: string]: string } = {
  en: 'English',
  uk: 'Українська',
};

export {
  API_BASE_URL,
  AUTH_NAME,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  BASE_HEADERS,
  DEFAULT_REDIRECT_URL,
  LANG_MAP,
};
