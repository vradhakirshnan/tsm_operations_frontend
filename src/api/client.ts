import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach authentication token & correlation headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('tsm_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Client-Version'] = '1.0.0';
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Unified error transformation
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    let friendlyMessage = 'An unexpected server error occurred.';

    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        friendlyMessage = 'Session expired or unauthenticated. Please re-authenticate.';
      } else if (status === 403) {
        friendlyMessage = 'You do not have permission to perform this operational action.';
      } else if (status === 404) {
        friendlyMessage = data?.detail || 'The requested resource was not found.';
      } else if (status === 409) {
        friendlyMessage = data?.detail || 'Conflict: Record already exists.';
      } else if (status === 422) {
        friendlyMessage = data?.detail || 'Validation error in request payload.';
      } else if (status >= 500) {
        friendlyMessage = data?.detail || 'Internal server error. Our ops team has been notified.';
      } else if (data?.detail) {
        friendlyMessage = data.detail;
      }
    } else if (error.request) {
      friendlyMessage = 'Unable to connect to backend service. Check network or server status.';
    }

    return Promise.reject({
      originalError: error,
      status: error.response?.status,
      message: friendlyMessage,
    });
  }
);

export default apiClient;
