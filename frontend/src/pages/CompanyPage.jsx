import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompany } from '../api';
import JobCard from '../components/jobs/JobCard';
import useSEO from '../hooks/useSEO';

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

function CompanyAvatar({ name }) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center shrink-0 font-bold text-text-primary text-2xl">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCompany(id)
      .then((r) => { setCompany(r.data.company); setJobs(r.data.jobs); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const companyName = company?.companyName || company?.name;
  useSEO(
    company
      ? { title: companyName, description: `${companyName} is hiring on Hustl. Browse ${jobs.length} open role${jobs.length !== 1 ? 's' : ''}${company.location ? ` in ${company.location}` : ''}.` }
      : {}
  );

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loadError || !company) {
    return (
      <div className="text-center py-32">
        <p className="text-h3 text-text-disabled mb-2">Company not found</p>
        <p className="text-sm text-text-secondary mb-6">This company may no longer be listed.</p>
        <button onClick={() => navigate('/jobs')} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
          Browse all jobs →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        ← Back to jobs
      </button>

      {/* Company header */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-8 mb-8">
        <div className="flex items-start gap-5">
          <CompanyAvatar name={companyName} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-h1 text-text-primary break-words">{companyName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {company.location && (
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <PinIcon /> {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  Visit website ↗
                </a>
              )}
              <span className="text-sm text-text-disabled">
                {jobs.length} open role{jobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        {company.companyDesc && (
          <p className="mt-6 pt-6 border-t border-border text-body text-text-secondary leading-relaxed whitespace-pre-wrap">
            {company.companyDesc}
          </p>
        )}
      </div>

      {/* Open roles */}
      <h2 className="text-h2 text-text-primary mb-4">Open roles</h2>
      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-text-disabled mb-1">No open roles right now</p>
          <p className="text-sm text-text-secondary">Check back later for new openings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
