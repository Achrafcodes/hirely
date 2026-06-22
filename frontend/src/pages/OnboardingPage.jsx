import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../api';
import SkillPicker from '../components/ui/SkillPicker';
import Input from '../components/ui/Input';

export default function OnboardingPage() {
  const { user, setUserFromToken } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(user?.role || 'candidate');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyDesc, setCompanyDesc] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'candidate' && skills.length === 0) {
      toast.error('Add at least one skill');
      return;
    }
    if (role === 'employer' && !companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await completeOnboarding({ role, skills, location, companyName, companyDesc, website });
      setUserFromToken(res.data);
      toast.success('Profile set up!');
      navigate(role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate', { replace: true });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            {user?.avatar && (
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-sm object-cover" />
            )}
            <div>
              <h1 className="text-h1 text-text-primary">Welcome, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-body text-text-secondary">Let's finish setting up your profile.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Role selector */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">I'm joining as a</p>
            <div className="grid grid-cols-2 gap-3">
                <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  role === 'candidate'
                    ? 'bg-accent-dim border-accent/50 text-accent-text'
                    : 'bg-surface border-border text-text-secondary hover:border-text-disabled'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Job seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  role === 'employer'
                    ? 'bg-accent-dim border-accent/50 text-accent-text'
                    : 'bg-surface border-border text-text-secondary hover:border-text-disabled'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                Employer
              </button>
            </div>
          </div>

          {/* Candidate fields */}
          {role === 'candidate' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Skills <span className="text-danger">*</span>
                </label>
                <SkillPicker value={skills} onChange={setSkills} />
                <p className="text-sm text-text-disabled mt-1">Search from the list or type to add your own</p>
              </div>

              <Input
                label="Location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Paris, France or Remote"
              />
            </>
          )}

          {/* Employer fields */}
          {role === 'employer' && (
            <>
              <Input
                label="Company name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">About the company</label>
                <textarea
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  rows={3}
                  placeholder="What does your company do?"
                  className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled resize-none focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <Input
                label="Website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
          >
            {loading ? 'Saving…' : 'Finish setup →'}
          </button>
        </form>
      </div>
    </div>
  );
}
