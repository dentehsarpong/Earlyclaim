/**
 * Centralized API configuration to prevent malformed URL errors.
 * Ensures consistent handling of VITE_API_URL across the application.
 */

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';

  // 1. Sanitize: Remove extra whitespace, quotes, or trailing slashes
  url = url.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

  // 2. Diagnostic Log
  if (!url) {
    console.warn('CRITICAL: VITE_API_URL is empty. API calls may fail.');
  } else if (url.includes('localhost') && window.location.hostname !== 'localhost') {
    console.warn('WARNING: VITE_API_URL points to localhost, but running in production.');
  }

  return url;
};

export const API_BASE_URL = getApiBaseUrl();
