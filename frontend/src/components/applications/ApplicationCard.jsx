import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

function CompanyAvatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 font-bold text-text-primary text-sm">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function ApplicationCard({ application, onWithdraw }) {
  const { job, status, coverLetter } = application;
  const companyName = job?.employer?.companyName || job?.employer?.name || 'Company';
  const date = new Date(application.appliedAt || application.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="featured-card bg-surface rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <CompanyAvatar name={companyName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-caption text-text-secondary mb-0.5">{companyName}</p>
              <Link
                to={`/jobs/${job?._id}`}
                className="text-sm font-semibold text-text-primary hover:text-accent transition-colors block truncate"
              >
                {job?.title}
              </Link>
              {job?.location && <p className="text-caption text-text-secondary mt-0.5">{job.location}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge status={status}>{status}</Badge>
              <span className="text-caption text-text-disabled">{date}</span>
            </div>
          </div>
        </div>
      </div>

      {coverLetter && (
        <p className="mt-3 pt-3 border-t border-border text-sm text-text-secondary line-clamp-2">
          {coverLetter}
        </p>
      )}

      {status === 'applied' && (
        <div className="mt-4 pt-3 border-t border-border">
          <button
            onClick={() => onWithdraw(application._id)}
            className="text-sm text-danger hover:text-danger/80 transition-colors font-medium"
          >
            Withdraw application
          </button>
        </div>
      )}
    </div>
  );
}
