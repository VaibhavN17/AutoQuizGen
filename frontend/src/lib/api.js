const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const configuredBase = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = configuredBase
  ? trimTrailingSlash(configuredBase)
  : import.meta.env.DEV
    ? '/api'
    : 'http://localhost:8082/api';

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
