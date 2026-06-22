import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyJobs, createJob, updateJob, deleteJob } from '../../api';
import JobForm from '../../components/jobs/JobForm';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { RowListSkeleton } from '../../components/ui/Skeleton';
import useSEO from '../../hooks/useSEO';
import { useAuth } from '../../context/AuthContext';
import useVerificationGate from '../../hooks/useVerificationGate';

const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const EyeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-2xl font-medium text-text-primary">{value}</p>
      <p className="text-caption text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

export default function EmployerDashboard() {
  useSEO({ title: 'Employer Dashboard' });
  const { user } = useAuth();
  const verifyGate = useVerificationGate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      toast.success('Job posted!');
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateJob(editing._id, data);
      setEditing(null);
      toast.success('Job updated!');
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(deleteTarget);
      toast.success('Job deleted');
      setDeleteTarget(null);
      fetchMyJobs();
    } catch {
      toast.error('Failed to delete job. Please try again.');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      await updateJob(job._id, { status: job.status === 'active' ? 'closed' : 'active' });
      toast.success(job.status === 'active' ? 'Job closed' : 'Job reopened');
      fetchMyJobs();
    } catch {
      toast.error('Failed to update job status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="h-9 w-40 bg-surface-raised rounded animate-pulse mb-8" />
        <RowListSkeleton count={4} />
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
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-h1 text-text-primary">Your jobs</h1>
          <p className="text-body text-text-secondary mt-1">
            {jobs.length} posting{jobs.length !== 1 ? 's' : ''}
            {user?._id && (
              <>
                {' · '}
                <Link to={`/companies/${user._id}`} className="text-accent hover:text-accent-hover transition-colors">
                  View public page ↗
                </Link>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => verifyGate() && (setShowForm(true), setEditing(null))}
          className="shrink-0 inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-base text-sm font-medium px-5 py-2.5 rounded-md transition-all duration-150 active:scale-[0.97]"
        >
          + Post a job
        </button>
      </div>

      {/* Summary analytics */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Active jobs" value={jobs.filter((j) => j.status === 'active').length} />
          <StatCard label="Total views" value={jobs.reduce((s, j) => s + (j.views || 0), 0).toLocaleString()} />
          <StatCard label="Total applicants" value={jobs.reduce((s, j) => s + (j.applicantCount || 0), 0)} />
          <StatCard label="Postings" value={jobs.length} />
        </div>
      )}

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
            className="bg-accent hover:bg-accent-hover text-base text-sm font-medium px-5 py-2.5 rounded-md transition-all duration-150 active:scale-[0.97]"
          >
            Post your first job
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div key={job._id} className="featured-card bg-surface rounded-xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge status={job.status}>{job.status}</Badge>
                    <Badge type={job.type}>{job.type}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{job.title}</h3>
                  <div className="mt-1.5 flex items-center gap-3 text-caption text-text-secondary flex-wrap">
                    {job.location && (
                      <span className="flex items-center gap-1"><PinIcon /> {job.location}</span>
                    )}
                    <span className="flex items-center gap-1"><EyeIcon /> {(job.views || 0).toLocaleString()} view{job.views === 1 ? '' : 's'}</span>
                    <span className="flex items-center gap-1"><UsersIcon /> {job.applicantCount || 0} applicant{job.applicantCount === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:shrink-0 sm:justify-end">
                  <Link
                    to={`/dashboard/employer/jobs/${job._id}/applicants`}
                    className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    Applicants →
                  </Link>
                  <button
                    onClick={() => { setEditing(job); setShowForm(false); }}
                    className="text-sm px-3 py-1.5 rounded-md bg-surface-raised border border-border text-text-secondary hover:border-accent hover:text-accent transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    className="text-sm px-3 py-1.5 rounded-md bg-surface-raised border border-border text-text-secondary hover:border-accent hover:text-accent transition-all"
                  >
                    {job.status === 'active' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(job._id)}
                    className="text-sm px-3 py-1.5 rounded-md bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete job posting?"
        message="This will permanently remove the job and all its applicants. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
