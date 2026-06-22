import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api';
import Input from '../components/ui/Input';
import useSEO from '../hooks/useSEO';

export default function ResetPasswordPage() {
  useSEO({ title: 'Set New Password' });
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password updated! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-base">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="2" width="4" height="20" rx="1"/><rect x="17" y="2" width="4" height="20" rx="1"/><polygon points="7,10.5 17,7 17,11 7,14.5"/></svg>
            </div>
            <span className="text-base font-semibold text-text-primary">Hustl</span>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-h2 text-text-primary">Set new password</h1>
            <p className="text-sm text-text-secondary mt-1">Must be at least 8 characters.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
