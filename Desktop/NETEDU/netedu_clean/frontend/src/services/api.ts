// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function flushRefreshQueue(token: string | null) {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;
    const url = String(originalRequest?.url || '');
    const isAuthEndpoint = url.includes('/auth/login/') || url.includes('/auth/register/') || url.includes('/auth/refresh/');

    if (status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      localStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
      const newAccess = refreshRes.data?.access;
      if (!newAccess) throw new Error('Missing refreshed access token');
      localStorage.setItem('access_token', newAccess);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      flushRefreshQueue(newAccess);
      return api(originalRequest);
    } catch (refreshErr) {
      localStorage.clear();
      flushRefreshQueue(null);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  register: (data: any) => api.post('/auth/register/', data),
};

// Users API
export const usersApi = {
  getMe: () => api.get('/users/me/'),
};

// Network API
export const networkApi = {
  getMeasurements: () => api.get('/network/measurements/'),
  submitMeasurement: (data: any) => api.post('/network/measurements/', data),
  getStats: () => api.get('/network/measurements/stats/'),
  getTrend: () => api.get('/network/measurements/trend/'),
  getPublicStats: () => api.get('/network/public-stats/'),
};

// Learning API
export const learningApi = {
  getCourses: () => api.get('/learning/courses/'),
  getCourse: (id: number) => api.get(`/learning/courses/${id}/`),
  createCourse: (data: any) => api.post('/learning/courses/', data),
  updateCourse: (id: number, data: any) => api.patch(`/learning/courses/${id}/`, data),
  enroll: (courseId: number) => api.post('/learning/enrollments/', { course: courseId }),
  getEnrollments: () => api.get('/learning/enrollments/'),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard/'),
  getCorrelation: () => api.get('/analytics/correlation/'),
  getLeaderboard: (limit = 20) => api.get(`/analytics/leaderboard/?limit=${limit}`),
  getMyRank: (window = 2) => api.get(`/analytics/leaderboard/me/?window=${window}`),
};

export const correlationApi = {
  getCorrelation: () => api.get('/analytics/correlation/'),
};

export default api;
