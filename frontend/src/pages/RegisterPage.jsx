import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import useSEO from '../hooks/useSEO';

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  useSEO({ title: 'Create Account', description: 'Join Hustl to apply for tech jobs or post openings and find your next great hire.' });
  const [role, setRole] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [extra, setExtra] = useState({ companyName: '', skills: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setEx = (k) => (e) => setExtra((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      if (role === 'candidate') {
        payload.skills = extra.skills.split(',').map((s) => s.trim()).filter(Boolean);
        payload.location = extra.location;
      }
      if (role === 'employer') payload.companyName = extra.companyName;
      const user = await register(payload);
      toast.success('Account created!');
      navigate(user.role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0ms' }}>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white">
              <BoltIcon />
            </div>
            <span className="text-base font-semibold text-text-primary">Hustl</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-h2 text-text-primary">Create account</h1>
            <p className="text-sm text-text-secondary mt-1">Start hiring or find your next role</p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-full border border-border bg-base p-1 mb-5">
            {['candidate', 'employer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize ${
                  role === r
                    ? 'bg-accent text-base shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Full name" value={form.name} onChange={set('name')} required placeholder="Jane Smith" />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" placeholder="••••••••" />

            {role === 'employer' && (
              <Input label="Company name" value={extra.companyName} onChange={setEx('companyName')} required placeholder="Acme Inc." />
            )}
            {role === 'candidate' && (
              <>
                <Input label="Location" placeholder="New York, NY" value={extra.location} onChange={setEx('location')} />
                <Input label="Skills" placeholder="React, Node.js, TypeScript" value={extra.skills} onChange={setEx('skills')} />
              </>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
