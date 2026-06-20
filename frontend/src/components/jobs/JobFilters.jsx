import { useState, useEffect } from 'react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'];

const inputClass = `w-full rounded-lg bg-base border border-border px-3 py-2 text-sm text-text-primary
  placeholder:text-text-disabled
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface
  hover:border-text-disabled transition-colors`;

export default function JobFilters({ onSearch, loading, initialValues = {} }) {
  const [q, setQ] = useState(initialValues.q || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [type, setType] = useState(initialValues.type || '');
  const [skills, setSkills] = useState(initialValues.skills || '');

  // Sync form when URL params change (back/forward navigation)
  useEffect(() => {
    setQ(initialValues.q || '');
    setLocation(initialValues.location || '');
    setType(initialValues.type || '');
    setSkills(initialValues.skills || '');
  }, [initialValues.q, initialValues.location, initialValues.type, initialValues.skills]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ q, location, type, skills });
  };

  const handleReset = () => {
    setQ(''); setLocation(''); setType(''); setSkills('');
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input className={inputClass} placeholder="Search jobs…" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className={inputClass} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
        <input className={inputClass} placeholder="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-full transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
        >
          Search
        </button>
      </div>
    </form>
  );
}
