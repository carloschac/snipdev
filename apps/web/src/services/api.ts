import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export const linksService = {
  create: (url: string, expiresAt?: string) =>
    api.post('/links', { url, expiresAt }),
  list: () => api.get('/links'),
  delete: (id: string) => api.delete(`/links/${id}`),
  togglePublic: (id: string) => api.patch(`/links/${id}/toggle-public`, {}),
};

export const analyticsService = {
  overview: () => api.get('/analytics'),
  linkStats: (linkId: string) => api.get(`/analytics/${linkId}`),
  clicksByDay: (days: number) =>
    api.get(`/analytics/clicks-by-day?days=${days}`),
};

export const profileService = {
  getPublic: (userId: string) => api.get(`/profile/${userId}`),
  getMe: () => api.get('/me'),
  updateMe: (data: { name?: string; username?: string; profileName?: string }) =>
    api.patch('/me', data),
  getByUsername: (username: string) => api.get(`/u/${username}`),
};
