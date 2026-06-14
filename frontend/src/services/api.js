/**
 * API Service Layer
 *
 * Axios instance with automatic Firebase token injection.
 * All backend API calls are centralized here for clean separation.
 */
import axios from 'axios';
import { auth } from '../config/firebase';

// Create axios instance with backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor — attach Firebase token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Token retrieval error:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Auth / Profile ───

export const getProfile = () => api.get('/auth/profile');

export const updateProfile = (data) => api.put('/auth/profile', data);

// ─── Meals ───

export const addMeal = (data) => api.post('/meals/add', data);

export const getTodayMeals = () => api.get('/meals/today');

export const getMealHistory = (startDate, endDate) =>
  api.get('/meals/history', { params: { startDate, endDate } });

export const deleteMeal = (id) => api.delete(`/meals/${id}`);

// ─── AI Analysis ───

export const analyzeText = (foodText) =>
  api.post('/ai/analyze-text', { foodText });

export const analyzeImage = (formData) =>
  api.post('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Reports ───

export const getWeeklyReport = () => api.get('/report/weekly');

export const getAlerts = () => api.get('/report/alerts');

/**
 * Download weekly report as PDF.
 * Creates a temporary link and triggers browser download.
 */
export const downloadPdf = async () => {
  const response = await api.get('/report/pdf', { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
