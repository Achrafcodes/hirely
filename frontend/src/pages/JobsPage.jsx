import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../api';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';

function getFiltersFromParams(params) {
  return {
    q:         params.get('q')         || '',
    location:  params.get('location')  || '',
    type:      params.get('type')      || '',
    skills:    params.get('skills')    || '',
    salaryMin: params.get('salaryMin') || '',
    salaryMax: params.get('salaryMax') || '',
    sort:      params.get('sort')      || 'newest',
  };
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const filters = getFiltersFromParams(searchParams);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJobs({ ...filters, page, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setJobs(res.data.jobs);
          setTotal(res.data.total);
          setPages(res.data.pages);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [searchParams]);

  const handleSearch = (f) => {
    const next = new URLSearchParams();
    if (f.q)         next.set('q',         f.q);
    if (f.location)  next.set('location',  f.location);
    if (f.type)      next.set('type',      f.type);
    if (f.skills)    next.set('skills',    f.skills);
    if (f.salaryMin) next.set('salaryMin', f.salaryMin);
    if (f.salaryMax) next.set('salaryMax', f.salaryMax);
    if (f.sort && f.sort !== 'newest') next.set('sort', f.sort);
    setSearchParams(next);
  };

  const handlePage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p > 1) next.set('page', String(p));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary">Find your next role</h1>
        <p className="text-body text-text-secondary mt-1">{total} open position{total !== 1 ? 's' : ''}</p>
      </div>

      <JobFilters onSearch={handleSearch} loading={loading} initialValues={filters} />

      <div className="mt-6 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-24 bg-surface rounded-xl border border-border">
            <p className="text-h3 text-text-disabled mb-2">No jobs found</p>
            <p className="text-sm text-text-secondary">Try adjusting your search filters</p>
          </div>
        )}

        {!loading && jobs.map((job, i) => (
          <div
            key={job._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => handlePage(page - 1)}
            className="px-4 py-2 text-sm font-medium rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-text-secondary px-3">
            Page {page} of {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => handlePage(page + 1)}
            className="px-4 py-2 text-sm font-medium rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
