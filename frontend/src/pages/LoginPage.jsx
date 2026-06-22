import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import GoogleButton from '../components/ui/GoogleButton';
import useSEO from '../hooks/useSEO';


export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  useSEO({ title: 'Sign In', description: 'Sign in to your Hustl account to apply for jobs and track your applications.' });
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign in failed');
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
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-base">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="2" width="4" height="20" rx="1"/><rect x="17" y="2" width="4" height="20" rx="1"/><polygon points="7,10.5 17,7 17,11 7,14.5"/></svg>
            </div>
            <span className="text-base font-semibold text-text-primary">Hustl</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
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
            <div>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <div className="mt-1.5 text-right">
                <Link to="/forgot-password" className="text-xs text-text-disabled hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-disabled">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <GoogleButton />
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
