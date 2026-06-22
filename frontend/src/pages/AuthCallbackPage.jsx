import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import LoadingScreen from '../components/layout/LoadingScreen';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=google');
      return;
    }

    localStorage.setItem('token', token);
    api.getMe()
      .then((res) => {
        setUserFromToken(res.data);
        const user = res.data;
        navigate(user.role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  return <LoadingScreen />;
}
