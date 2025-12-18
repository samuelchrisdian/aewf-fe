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
      timeout: 10000,
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

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
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
            // Refresh failed, clear auth and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const apiError: ApiError = {
        message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
        code: axiosError.response?.data?.code,
        status: axiosError.response?.status,
      };
      throw apiError;
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

