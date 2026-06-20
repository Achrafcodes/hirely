import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, createJob, updateJob, deleteJob } from '../../api';
import JobForm from '../../components/jobs/JobForm';
import Badge from '../../components/ui/Badge';

const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMyJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyJobs();
      setJobs(res.data.jobs);
    } catch {
      setError('Failed to load your jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createJob(data);
      setShowForm(false);
      fetchMyJobs();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateJob(editing._id, data);
      setEditing(null);
      fetchMyJobs();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      fetchMyJobs();
    } catch {
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      await updateJob(job._id, { status: job.status === 'active' ? 'closed' : 'active' });
      fetchMyJobs();
    } catch {
      alert('Failed to update job status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32 bg-surface rounded-xl border border-border">
        <p className="text-h3 text-danger mb-2">Something went wrong</p>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <button
          onClick={fetchMyJobs}
          className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 text-text-primary">Your jobs</h1>
          <p className="text-body text-text-secondary mt-1">
            {jobs.length} posting{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97]"
        >
          + Post a job
        </button>
      </div>

      {/* Job form — key forces remount when switching between jobs */}
      {(showForm || editing) && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <h2 className="text-h3 text-text-primary mb-5">{editing ? 'Edit job' : 'New job'}</h2>
          <JobForm
            key={editing?._id || 'new'}
            initial={editing || {}}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            loading={saving}
          />
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !showForm ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-text-disabled mb-2">No jobs posted yet</p>
          <p className="text-sm text-text-secondary mb-6">Create your first listing to start receiving applications</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97]"
          >
            Post your first job
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div key={job._id} className="featured-card bg-surface rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge status={job.status}>{job.status}</Badge>
                    <Badge type={job.type}>{job.type}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{job.title}</h3>
                  {job.location && (
                    <span className="mt-1 flex items-center gap-1 text-caption text-text-secondary">
                      <PinIcon /> {job.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link
                    to={`/dashboard/employer/jobs/${job._id}/applicants`}
                    className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    Applicants →
                  </Link>
                  <button
                    onClick={() => { setEditing(job); setShowForm(false); }}
                    className="text-sm px-3 py-1.5 rounded-full bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    className="text-sm px-3 py-1.5 rounded-full bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
                  >
                    {job.status === 'active' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="text-sm px-3 py-1.5 rounded-full bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
