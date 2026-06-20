import { useEffect, useState } from 'react';
import { getMyApplications, withdrawApplication } from '../../api';
import ApplicationCard from '../../components/applications/ApplicationCard';

const STATUSES = ['', 'applied', 'reviewed', 'interview', 'rejected', 'hired'];

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
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

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    await withdrawApplication(id);
    fetchApplications();
  };

  const handleFilterChange = (s) => {
    setStatusFilter(s);
    fetchApplications(s);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary">My applications</h1>
        <p className="text-body text-text-secondary mt-1">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

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
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-danger mb-2">Something went wrong</p>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => fetchApplications()}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      ) : applications.length === 0 ? (
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
      )}
    </div>
  );
}
