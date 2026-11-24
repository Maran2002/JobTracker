'use client';

import { requestApi } from '../../app/actions/api';

/** Axios-compatible interface backed by a Next Server Action, never browser fetch/XHR to /api. */
const request = async (method, url, config = {}) => {
  const path = url.startsWith('/') ? url : `/${url}`;
  const query = config.params ? `?${new URLSearchParams(config.params)}` : '';
  const result = await requestApi(method.toUpperCase(), `${path}${query}`, method === 'get' ? undefined : config.data);
  if (result.status < 200 || result.status >= 300) {
    const error = new Error(result.data?.message || `Request failed (${result.status})`);
    error.response = { status: result.status, data: result.data };
    throw error;
  }
  return { data: result.data, status: result.status };
};

const api = {
  get: (url, config) => request('get', url, config),
  post: (url, data, config) => request('post', url, { ...config, data }),
  put: (url, data, config) => request('put', url, { ...config, data }),
  patch: (url, data, config) => request('patch', url, { ...config, data }),
  delete: (url, config = {}) => request('delete', url, config),
};

export default api;
