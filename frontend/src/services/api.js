/**
 * api.js — a very small wrapper around the browser Fetch API.
 *
 * Why a wrapper?
 *  - one place to add the JWT token to every request
 *  - one place to convert non-2xx responses into JS errors with a readable
 *    message, so components can simply try/catch and show a toast
 *
 * All backend endpoints live under /api (the Vite dev server proxies them
 * to the Express server on port 5000).
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'studyhub_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Error thrown for any failed request. `status` and `errors` help the UI. */
export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const request = async (method, path, body) => {
  const token = getToken();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined && body !== null) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (networkError) {
    throw new ApiError('Cannot reach the server. Please check that the backend is running.', 0);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    // 401 -> the stored token is no longer valid, remove it so the app
    // redirects to the login page.
    if (response.status === 401) clearToken();
    throw new ApiError(
      payload.message || `Request failed (${response.status})`,
      response.status,
      payload.errors || []
    );
  }

  return payload;
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

/** Build a query string from an object, skipping empty values. */
export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export default api;
