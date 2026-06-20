import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DollarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

function CompanyAvatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-text-primary">{name?.[0]?.toUpperCase() ?? '?'}</span>
    </div>
  );
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function JobCard({ job }) {
  const companyName = job.employer?.companyName || job.employer?.name;
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link to={`/jobs/${job._id}`} className="block group">
      <div className="featured-card bg-surface rounded-xl border border-border shadow-card p-5">
        <div className="flex items-start gap-3 mb-3">
          <CompanyAvatar name={companyName} />
          <div className="flex-1 min-w-0">
            <p className="text-caption text-text-secondary mb-0.5 truncate">{companyName}</p>
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 leading-snug">
              {job.title}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge type={job.type}>{job.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            <span className="text-caption text-text-disabled">{timeAgo(job.createdAt)}</span>
          </div>
        </div>

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-caption px-2 py-0.5 rounded bg-surface-raised text-text-secondary border border-border"
              >
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-caption text-text-disabled">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-caption text-text-secondary">
          {job.location && (
            <span className="flex items-center gap-1">
              <PinIcon /> {job.location}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1">
              <DollarIcon /> {salary}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
