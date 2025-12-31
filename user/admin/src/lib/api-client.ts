import axios from 'axios';
import { toast } from 'sonner';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL;

const baseURL =
  typeof window !== 'undefined' && rawBaseURL?.includes('backend')
    ? rawBaseURL.replace('backend', 'localhost')
    : rawBaseURL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        // Optional: Redirect to login if not already there
        // window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
