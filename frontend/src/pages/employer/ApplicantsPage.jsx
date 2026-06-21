import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getJob, getApplicants, updateApplicationStatus } from '../../api';
import ApplicantRow from '../../components/applications/ApplicantRow';
import Badge from '../../components/ui/Badge';
import { RowListSkeleton } from '../../components/ui/Skeleton';

const STATUSES = ['', 'applied', 'reviewed', 'interview', 'rejected', 'hired'];

export default function ApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplicants = async (s = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const [jobRes, appRes] = await Promise.all([
        getJob(id),
        getApplicants(id, { status: s || undefined, limit: 50 }),
      ]);
      setJob(jobRes.data.job);
      setApplications(appRes.data.applications);
    } catch {
      setError('Failed to load applicants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      toast.success('Status updated');
      fetchApplicants();
    } catch {
      toast.error('Failed to update status');
      fetchApplicants();
    }
  };

  const handleFilterChange = (s) => {
    setStatusFilter(s);
    fetchApplicants(s);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <button
        onClick={() => navigate('/dashboard/employer')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        ← Dashboard
      </button>

      {job && (
        <div className="mb-8">
          <h1 className="text-h1 text-text-primary">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-body text-text-secondary">{job.location}</span>
            <span className="text-text-disabled">·</span>
            <Badge status={job.status}>{job.status}</Badge>
          </div>
        </div>
      )}

      {/* Status filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => handleFilterChange(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 capitalize ${
              statusFilter === s
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <RowListSkeleton count={4} />
      ) : error ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-danger mb-2">Something went wrong</p>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => fetchApplicants()}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-text-disabled mb-1">No applicants yet</p>
          <p className="text-sm text-text-secondary">Applications will appear here once candidates apply</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-secondary mb-4">
            {applications.length} applicant{applications.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <ApplicantRow key={app._id} application={app} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
