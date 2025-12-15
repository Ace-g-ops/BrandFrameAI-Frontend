import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://brandframeai.fly.dev/api";

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Only redirect if not already on auth page
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    
    // Handle 422 Validation errors - Return validation messages
    if (error.response?.status === 422) {
      const data = error.response.data as any;
      if (data.errors) {
        // Laravel validation errors format
        const firstError = Object.values(data.errors)[0] as string[];
        error.message = firstError?.[0] || data.message || 'Validation failed';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Utility function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response?.data) {
      return axiosError.response.data.message || 
             axiosError.response.data.error || 
             axiosError.message || 
             'An error occurred';
    }
    
    if (axiosError.request) {
      return 'Network error. Please check your connection.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Utility function to create FormData for file uploads
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle array of files (e.g., product_images[])
        value.forEach((item, index) => {
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${key}[]`, item);
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

// Type-safe API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

// Helper to extract data from Laravel API responses
export const extractApiData = <T>(response: any): T => {
  // Laravel often wraps responses in { data: ... } or returns directly
  // Check if response has a 'data' property (could be object or array)
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

