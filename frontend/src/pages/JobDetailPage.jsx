import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getJob, applyToJob } from '../api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const DollarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

function CompanyAvatar({ name, size = 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 font-bold text-text-primary`}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max)} / yr`;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getJob(id)
      .then((r) => setJob(r.data.job))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setApplying(true);
    try {
      const fd = new FormData();
      if (coverLetter) fd.append('coverLetter', coverLetter);
      if (resumeFile) fd.append('resume', resumeFile);
      await applyToJob(id, fd);
      setApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted!');
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="text-center py-32">
        <p className="text-h3 text-text-disabled mb-2">{loadError ? 'Failed to load job' : 'Job not found'}</p>
        <p className="text-sm text-text-secondary mb-6">{loadError ? 'Check your connection and try again.' : 'This role may have been removed.'}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
          {loadError ? 'Retry' : 'Browse all jobs →'}
        </button>
      </div>
    );
  }

  const companyName = job.employer?.companyName || job.employer?.name;
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const typeLabel = job.type ? job.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;

  // Dynamic page title
  useEffect(() => {
    if (job) document.title = `${job.title} at ${companyName} — Hirely`;
    return () => { document.title = 'Hirely — Find Work That Matters'; };
  }, [job, companyName]);

  return (
    <div className="max-w-3xl animate-fade-in-up" style={{ animationDelay: '0ms' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        ← Back to jobs
      </button>

      {/* Header card */}
      <div className="bg-surface border border-border rounded-xl p-8 mb-4">
        <div className="flex items-start gap-4 mb-6">
          <CompanyAvatar name={companyName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-text-secondary">
                {companyName}
                {job.employer?.website && (
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-accent hover:text-accent-hover transition-colors"
                  >
                    ↗
                  </a>
                )}
              </p>
              <Badge status={job.status}>{job.status}</Badge>
            </div>
            <h1 className="text-h1 text-text-primary">{job.title}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border">
          {typeLabel && <Badge type={job.type}>{typeLabel}</Badge>}
          {job.location && (
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <PinIcon /> {job.location}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <DollarIcon /> {salary}
            </span>
          )}
          <span className="text-sm text-text-disabled ml-auto">Posted {postedDate}</span>
        </div>

        {/* Description */}
        <div className="py-6 border-b border-border">
          <h2 className="text-h3 text-text-primary mb-3">About the role</h2>
          <p className="text-body text-text-secondary whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="py-6 border-b border-border">
            <h2 className="text-h3 text-text-primary mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="text-sm px-3 py-1 rounded-full bg-surface-raised text-text-secondary border border-border">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply section */}
        {user?.role === 'candidate' && job.status === 'active' && (
          <div className="pt-6">
            {applied ? (
              <div className="flex items-center gap-2 text-success font-medium">
                <span>✓</span> Application submitted!
              </div>
            ) : showApplyForm ? (
              <form onSubmit={handleApply} className="flex flex-col gap-4">
                <h2 className="text-h3 text-text-primary">Apply for this role</h2>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-medium">Cover letter <span className="text-text-disabled">(optional)</span></label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    placeholder="Tell them why you're a great fit…"
                    className="w-full rounded-lg bg-surface-raised border border-border px-3 py-2.5 text-body text-text-primary
                      placeholder:text-text-disabled resize-y
                      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-base
                      transition-colors hover:border-text-disabled"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-medium">
                    Resume <span className="text-text-disabled">(PDF or Word, max 5 MB{user.resumeUrl ? ' — or uses your profile resume' : ''})</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="text-sm text-text-secondary
                      file:mr-3 file:rounded-full file:border-0
                      file:bg-surface-raised file:px-3 file:py-1.5 file:text-sm file:text-text-primary
                      file:cursor-pointer hover:file:bg-border transition-colors"
                  />
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={applying}
                    className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
                  >
                    {applying ? 'Submitting…' : 'Submit application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowApplyForm(true)}
                className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97]"
              >
                Apply now
              </button>
            )}
          </div>
        )}

        {!user && job.status === 'active' && (
          <div className="pt-6">
            <button
              onClick={() => navigate('/register')}
              className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97]"
            >
              Sign up to apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
