import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.patch('/auth/me', data);
export const uploadResume = (formData) =>
  api.post('/auth/me/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const resendVerification = () => api.post('/auth/resend-verification');
export const completeOnboarding = (data) => api.post('/auth/onboarding', data);

// Jobs
export const getStats = () => api.get('/jobs/stats');
export const getJobs = (params) => api.get('/jobs', { params });
export const getMyJobs = () => api.get('/jobs/mine');
export const getJob = (id) => api.get(`/jobs/${id}`);
export const getRelatedJobs = (id) => api.get(`/jobs/${id}/related`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getApplicants = (jobId, params) => api.get(`/jobs/${jobId}/applicants`, { params });

// Companies
export const getCompanies = () => api.get('/companies');
export const getCompany = (id) => api.get(`/companies/${id}`);

// Saved jobs
export const getSavedJobs = () => api.get('/jobs/saved');
export const saveJob = (id) => api.put(`/jobs/${id}/save`);
export const unsaveJob = (id) => api.delete(`/jobs/${id}/save`);

// Applications
export const applyToJob = (jobId, formData) =>
  api.post(`/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyApplications = (params) => api.get('/applications/me', { params });
export const updateApplicationStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status });
export const withdrawApplication = (id) => api.delete(`/applications/${id}`);

// Messaging
export const getConversations = () => api.get('/conversations');
export const createConversation = (data) => api.post('/conversations', data);
export const getUnreadCount = () => api.get('/conversations/unread');
export const getMessages = (conversationId) => api.get('/messages', { params: { conversationId } });
export const sendMessage = (data) => api.post('/messages', data);
