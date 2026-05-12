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
};

export const linksService = {
  create: (url: string) => api.post('/links', { url }),
  list: () => api.get('/links'),
  delete: (id: string) => api.delete(`/links/${id}`),
};

export const analyticsService = {
  overview: () => api.get('/analytics'),
  linkStats: (linkId: string) => api.get(`/analytics/${linkId}`),
  clicksByDay: (days: number) =>
    api.get(`/analytics/clicks-by-day?days=${days}`),
};
