import Badge from '../ui/Badge';

const STATUSES = ['applied', 'reviewed', 'interview', 'rejected', 'hired'];

function CandidateAvatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 font-bold text-text-primary text-sm">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function ApplicantRow({ application, onStatusChange }) {
  const { candidate, status, resumeUrl, coverLetter } = application;

  return (
    <div className="featured-card bg-surface rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={candidate?.name} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{candidate?.name}</p>
              <p className="text-caption text-text-secondary truncate">{candidate?.email}</p>
              {candidate?.skills?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-caption px-2 py-0.5 rounded bg-surface-raised text-text-secondary border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap sm:shrink-0">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                >
                  Resume ↗
                </a>
              )}
              <select
                value={status}
                onChange={(e) => onStatusChange(application._id, e.target.value)}
                className="rounded-full bg-surface-raised border border-border px-3 py-1.5 text-sm text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-base
                  transition-colors hover:border-text-disabled cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
              <Badge status={status}>{status}</Badge>
            </div>
          </div>
        </div>
      </div>
      {coverLetter && (
        <p className="mt-3 pt-3 border-t border-border text-sm text-text-secondary line-clamp-2">{coverLetter}</p>
      )}
    </div>
  );
}
