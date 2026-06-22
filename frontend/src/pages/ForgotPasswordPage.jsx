import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api';
import Input from '../components/ui/Input';
import useSEO from '../hooks/useSEO';

export default function ForgotPasswordPage() {
  useSEO({ title: 'Reset Password' });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="text-h2 text-text-primary mb-2">Check your email</h1>
          <p className="text-sm text-text-secondary mb-6">
            If <span className="font-mono text-accent">{email}</span> has an account, we've sent a reset link. It expires in 1 hour.
          </p>
          <Link to="/login" className="text-sm text-accent hover:text-accent-hover transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-h2 text-text-primary">Forgot password?</h1>
            <p className="text-sm text-text-secondary mt-1">Enter your email and we'll send a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-text-secondary">
          Remember it?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
