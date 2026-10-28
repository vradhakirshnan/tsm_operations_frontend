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

// Response Interceptor: Unified error transformation and automatic logout handling
apiClient.interceptors.response.use(
  (response) => {
    // Check if backend instructed logout flag in any response
    const data = response.data;
    if (
      data &&
      typeof data === 'object' &&
      (data.logout === true ||
        data.logout === 'True' ||
        data.logout === 'true')
    ) {
      localStorage.removeItem('tsm_auth_token');
      localStorage.removeItem('tsm_user');
      window.location.href = '/login?reason=session_terminated';
    }
    return response;
  },
  (error: AxiosError<{ detail?: string; message?: string; logout?: boolean | string }>) => {
    // If backend returns 401 or logout in error payload
    if (error.response?.data?.logout === true || error.response?.data?.logout === 'True') {
      localStorage.removeItem('tsm_auth_token');
      localStorage.removeItem('tsm_user');
      window.location.href = '/login?reason=session_terminated';
    }

    const serverMessage = error.response?.data?.message || error.response?.data?.detail;
    let friendlyMessage = serverMessage || 'An unexpected server error occurred.';

    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        friendlyMessage = data?.message || 'Session expired or unauthenticated. Please re-authenticate.';
        localStorage.removeItem('tsm_auth_token');
        localStorage.removeItem('tsm_user');
      } else if (status === 403) {
        friendlyMessage = data?.message || 'You do not have permission to perform this operational action.';
      } else if (status === 404) {
        friendlyMessage = data?.message || data?.detail || 'The requested resource was not found.';
      } else if (status === 409) {
        friendlyMessage = data?.message || data?.detail || 'Conflict: Record already exists.';
      } else if (status === 422) {
        friendlyMessage = data?.message || data?.detail || 'Validation error in request payload.';
      } else if (status >= 500) {
        friendlyMessage = data?.message || data?.detail || 'Internal server error. Our ops team has been notified.';
      } else if (serverMessage) {
        friendlyMessage = serverMessage;
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
