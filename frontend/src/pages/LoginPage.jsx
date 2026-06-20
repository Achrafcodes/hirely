import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0ms' }}>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white">
              <BoltIcon />
            </div>
            <span className="text-base font-semibold text-text-primary">Hirely</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="mb-6">
            <h1 className="text-h2 text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-text-secondary">
          No account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
