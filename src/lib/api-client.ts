import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// If VITE_API_BASE_URL is empty, use empty string (Vite proxy will handle it)
// Otherwise use the provided URL or fallback to localhost:5001
const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:5001';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5 minutes - for long-running operations (retrain, predict all)
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Skip token refresh for login/auth endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                              originalRequest.url?.includes('/auth/refresh') ||
                              originalRequest.url?.includes('/auth/register');

        // If 401 and not already retried and NOT from auth endpoints, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              // No refresh token available, clear auth and reject
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              return Promise.reject(error);
            }

            const response = await axios.post<ApiResponse<{ access_token: string }>>(
              `${BASE_URL}/api/v1/auth/refresh`,
              { refresh_token: refreshToken }
            );

            const { access_token } = response.data.data!;
            localStorage.setItem('access_token', access_token);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear auth
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            return Promise.reject(error); // Return original error, not refresh error
          }
        }

        // For auth endpoints or other errors, reject immediately
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      // Throw the original axios error to preserve response structure
      // This allows calling code to access err.response.data.error.message
      throw error;
    }
    throw error;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get(url, config);
      // Return the full response.data (which includes data, pagination, success, etc.)
      return response.data as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put(url, data, config);
      return response.data as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete(url, config);
      return response.data as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Raw axios instance for special cases
  get axios() {
    return this.client;
  }
}

export const apiClient = new ApiClient();

