import { useState, useEffect } from 'react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'];
const formatType = (t) => t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary', label: 'Highest salary' },
];

const inputClass = `w-full rounded-lg bg-base border border-border px-3 py-2 text-sm text-text-primary
  placeholder:text-text-disabled
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface
  hover:border-text-disabled transition-colors`;

export default function JobFilters({ onSearch, loading, initialValues = {} }) {
  const [q, setQ] = useState(initialValues.q || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [type, setType] = useState(initialValues.type || '');
  const [skills, setSkills] = useState(initialValues.skills || '');
  const [salaryMin, setSalaryMin] = useState(initialValues.salaryMin || '');
  const [salaryMax, setSalaryMax] = useState(initialValues.salaryMax || '');
  const [sort, setSort] = useState(initialValues.sort || 'newest');

  useEffect(() => {
    setQ(initialValues.q || '');
    setLocation(initialValues.location || '');
    setType(initialValues.type || '');
    setSkills(initialValues.skills || '');
    setSalaryMin(initialValues.salaryMin || '');
    setSalaryMax(initialValues.salaryMax || '');
    setSort(initialValues.sort || 'newest');
  }, [initialValues.q, initialValues.location, initialValues.type, initialValues.skills, initialValues.salaryMin, initialValues.salaryMax, initialValues.sort]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ q, location, type, skills, salaryMin, salaryMax, sort });
  };

  const handleReset = () => {
    setQ(''); setLocation(''); setType(''); setSkills('');
    setSalaryMin(''); setSalaryMax(''); setSort('newest');
    onSearch({});
  };

  // Active filter chips
  const activeFilters = [
    type && { key: 'type', label: formatType(type), clear: () => { setType(''); onSearch({ q, location, type: '', skills, salaryMin, salaryMax, sort }); } },
    skills && { key: 'skills', label: `Skills: ${skills}`, clear: () => { setSkills(''); onSearch({ q, location, type, skills: '', salaryMin, salaryMax, sort }); } },
    salaryMin && { key: 'salaryMin', label: `Min $${salaryMin}`, clear: () => { setSalaryMin(''); onSearch({ q, location, type, skills, salaryMin: '', salaryMax, sort }); } },
    salaryMax && { key: 'salaryMax', label: `Max $${salaryMax}`, clear: () => { setSalaryMax(''); onSearch({ q, location, type, skills, salaryMin, salaryMax: '', sort }); } },
    sort !== 'newest' && { key: 'sort', label: SORT_OPTIONS.find(s => s.value === sort)?.label, clear: () => { setSort('newest'); onSearch({ q, location, type, skills, salaryMin, salaryMax, sort: 'newest' }); } },
  ].filter(Boolean);

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className={inputClass} placeholder="Search jobs…" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className={inputClass} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="">All types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{formatType(t)}</option>
            ))}
          </select>
          <input className={inputClass} placeholder="Skills (e.g. React, Node.js)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <input
            className={inputClass}
            type="number"
            placeholder="Min salary ($)"
            value={salaryMin}
            min={0}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Max salary ($)"
            value={salaryMax}
            min={0}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
              >
                {f.label}
                <button type="button" onClick={f.clear} className="hover:text-accent-hover leading-none">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
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
        </div>
      </form>
    </div>
  );
}
