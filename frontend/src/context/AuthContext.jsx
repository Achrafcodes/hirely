import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.getMe()
      .then((res) => setUser(res.data))
      .catch((err) => { if (err.response?.status === 401) localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (data) => {
    const res = await api.updateMe(data);
    setUser(res.data);
    return res.data;
  };

  const uploadResume = async (file) => {
    const fd = new FormData();
    fd.append('resume', file);
    const res = await api.uploadResume(fd);
    setUser(res.data);
    return res.data;
  };

  const toggleSaveJob = async (jobId) => {
    const isSaved = user?.savedJobs?.some((id) => String(id) === String(jobId));
    // Optimistic update
    setUser((u) => ({
      ...u,
      savedJobs: isSaved
        ? (u.savedJobs || []).filter((id) => String(id) !== String(jobId))
        : [...(u.savedJobs || []), jobId],
    }));
    try {
      if (isSaved) await api.unsaveJob(jobId);
      else await api.saveJob(jobId);
    } catch (err) {
      // Revert on failure
      setUser((u) => ({
        ...u,
        savedJobs: isSaved
          ? [...(u.savedJobs || []), jobId]
          : (u.savedJobs || []).filter((id) => String(id) !== String(jobId)),
      }));
      throw err;
    }
    return !isSaved;
  };

  const isJobSaved = (jobId) => user?.savedJobs?.some((id) => String(id) === String(jobId)) ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, uploadResume, toggleSaveJob, isJobSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
