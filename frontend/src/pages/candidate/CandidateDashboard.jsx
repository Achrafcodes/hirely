import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyApplications, withdrawApplication, getSavedJobs } from '../../api';
import ApplicationCard from '../../components/applications/ApplicationCard';
import JobCard from '../../components/jobs/JobCard';
import { RowListSkeleton, JobListSkeleton } from '../../components/ui/Skeleton';
import useSEO from '../../hooks/useSEO';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['', 'applied', 'reviewed', 'interview', 'rejected', 'hired'];

export default function CandidateDashboard() {
  useSEO({ title: 'My Applications' });
  const { user } = useAuth();
  const [tab, setTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplications = async (s = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyApplications({ status: s || undefined, limit: 50 });
      setApplications(res.data.applications);
    } catch {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSavedJobs();
      setSavedJobs(res.data.jobs);
    } catch {
      setError('Failed to load saved jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'applications') fetchApplications();
    else fetchSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Keep the saved list in sync when a job is un-saved from a card
  const savedCount = user?.savedJobs?.length ?? 0;
  useEffect(() => {
    if (tab === 'saved') {
      setSavedJobs((prev) => prev.filter((j) => user?.savedJobs?.some((id) => String(id) === String(j._id))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCount]);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(id);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch {
      toast.error('Failed to withdraw application');
    }
  };

  const handleFilterChange = (s) => {
    setStatusFilter(s);
    fetchApplications(s);
  };

  const retry = () => (tab === 'applications' ? fetchApplications() : fetchSavedJobs());

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-6">
        <h1 className="text-h1 text-text-primary">My dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-raised rounded-lg mb-6 w-fit">
        {[
          { key: 'applications', label: 'Applications' },
          { key: 'saved', label: `Saved${savedCount ? ` (${savedCount})` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Status filters — applications tab only */}
      {tab === 'applications' && (
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
      )}

      {loading ? (
        tab === 'applications' ? <RowListSkeleton count={4} /> : <JobListSkeleton count={4} grid />
      ) : error ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-danger mb-2">Something went wrong</p>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={retry}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      ) : tab === 'applications' ? (
        applications.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-xl border border-border">
            <p className="text-h3 text-text-disabled mb-1">No applications yet</p>
            <p className="text-sm text-text-secondary">Browse open roles and apply to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <ApplicationCard key={app._id} application={app} onWithdraw={handleWithdraw} />
            ))}
          </div>
        )
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-text-disabled mb-1">No saved jobs yet</p>
          <p className="text-sm text-text-secondary">Tap the heart on any job to save it for later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
