import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    companyName: user?.companyName || '',
    companyDesc: user?.companyDesc || '',
    website: user?.website || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (user.role === 'candidate') {
        payload.skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      await updateUser(payload);
      toast.success('Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary">Profile</h1>
        <p className="text-body text-text-secondary mt-1 capitalize">{user?.role} account</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" value={form.name} onChange={set('name')} />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-50" />

          {user?.role === 'candidate' && (
            <>
              <Input label="Location" placeholder="San Francisco, CA" value={form.location} onChange={set('location')} />
              <Input label="Skills" placeholder="React, Node.js, TypeScript" value={form.skills} onChange={set('skills')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={4}
                  placeholder="A short intro about yourself…"
                  className="w-full rounded-lg bg-base border border-border px-3 py-2.5 text-body text-text-primary
                    placeholder:text-text-disabled resize-y
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-base
                    transition-colors hover:border-text-disabled"
                />
              </div>
            </>
          )}

          {user?.role === 'employer' && (
            <>
              <Input label="Company name" value={form.companyName} onChange={set('companyName')} />
              <Input label="Website" type="url" placeholder="https://…" value={form.website} onChange={set('website')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-medium">Company description</label>
                <textarea
                  value={form.companyDesc}
                  onChange={set('companyDesc')}
                  rows={4}
                  placeholder="What does your company do?"
                  className="w-full rounded-lg bg-base border border-border px-3 py-2.5 text-body text-text-primary
                    placeholder:text-text-disabled resize-y
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-base
                    transition-colors hover:border-text-disabled"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
