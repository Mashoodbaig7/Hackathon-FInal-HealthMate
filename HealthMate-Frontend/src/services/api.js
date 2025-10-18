import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('healthmate_token');
      localStorage.removeItem('healthmate_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  getDashboard: () => api.get('/user/dashboard'),
  changePassword: (passwordData) => api.put('/user/change-password', passwordData),
  addMedicalCondition: (condition) => api.post('/user/medical-conditions', condition),
  updateMedicalCondition: (id, condition) => api.put(`/user/medical-conditions/${id}`, condition),
  deleteMedicalCondition: (id) => api.delete(`/user/medical-conditions/${id}`),
  addMedication: (medication) => api.post('/user/medications', medication),
};

// Reports API
export const reportsAPI = {
  getReports: (params = {}) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  uploadReport: (formData) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  addNote: (id, note) => api.post(`/reports/${id}/notes`, note),
  getStats: () => api.get('/reports/stats/overview'),
};

// Vitals API
export const vitalsAPI = {
  getVitals: (params = {}) => api.get('/vitals', { params }),
  getVital: (id) => api.get(`/vitals/${id}`),
  createVital: (data) => api.post('/vitals', data),
  updateVital: (id, data) => api.put(`/vitals/${id}`, data),
  deleteVital: (id) => api.delete(`/vitals/${id}`),
  getStats: () => api.get('/vitals/stats/overview'),
  getChartData: (type, params = {}) => api.get(`/vitals/charts/${type}`, { params }),
};

// Family Members API
export const familyMembersAPI = {
  getFamilyMembers: () => api.get('/family-members'),
  getFamilyMember: (id) => api.get(`/family-members/${id}`),
  createFamilyMember: (data) => api.post('/family-members', data),
  updateFamilyMember: (id, data) => api.put(`/family-members/${id}`, data),
  deleteFamilyMember: (id) => api.delete(`/family-members/${id}`),
  addMedicalCondition: (id, condition) => api.post(`/family-members/${id}/medical-conditions`, condition),
};

export default api;
