import { useState, useEffect } from 'react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary', label: 'Highest salary' },
];
const formatType = (t) => t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const inputClass = `w-full rounded-lg bg-surface-raised border border-border px-3 py-2 text-sm text-text-primary
  placeholder:text-text-disabled
  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
  hover:border-text-disabled transition-colors`;

const selectClass = `${inputClass} appearance-none cursor-pointer`;

function SelectWrapper({ value, onChange, children, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={selectClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function NumberInput({ value, onChange, placeholder }) {
  const dec = () => { const v = Math.max(0, (parseInt(value) || 0) - 1000); onChange({ target: { value: String(v) } }); };
  const inc = () => { const v = (parseInt(value) || 0) + 1000; onChange({ target: { value: String(v) } }); };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={dec}
        className="absolute left-2 w-5 h-5 flex items-center justify-center rounded text-text-disabled hover:text-text-primary hover:bg-surface transition-colors text-base leading-none"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={0}
        className={`${inputClass} px-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <button
        type="button"
        onClick={inc}
        className="absolute right-2 w-5 h-5 flex items-center justify-center rounded text-text-disabled hover:text-text-primary hover:bg-surface transition-colors text-base leading-none"
      >
        +
      </button>
    </div>
  );
}

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

  const activeFilters = [
    type      && { key: 'type',      label: formatType(type),         clear: () => { setType('');      onSearch({ q, location, type: '',      skills, salaryMin, salaryMax, sort }); } },
    skills    && { key: 'skills',    label: `Skills: ${skills}`,      clear: () => { setSkills('');    onSearch({ q, location, type, skills: '',    salaryMin, salaryMax, sort }); } },
    salaryMin && { key: 'salaryMin', label: `Min $${salaryMin}`,      clear: () => { setSalaryMin(''); onSearch({ q, location, type, skills, salaryMin: '', salaryMax, sort }); } },
    salaryMax && { key: 'salaryMax', label: `Max $${salaryMax}`,      clear: () => { setSalaryMax(''); onSearch({ q, location, type, skills, salaryMin, salaryMax: '', sort }); } },
    sort !== 'newest' && { key: 'sort', label: SORT_OPTIONS.find(s => s.value === sort)?.label, clear: () => { setSort('newest'); onSearch({ q, location, type, skills, salaryMin, salaryMax, sort: 'newest' }); } },
  ].filter(Boolean);

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className={inputClass} placeholder="Search jobs…" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className={inputClass} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <SelectWrapper value={type} onChange={(e) => setType(e.target.value)} placeholder="All types">
            {JOB_TYPES.map((t) => <option key={t} value={t}>{formatType(t)}</option>)}
          </SelectWrapper>
          <input className={inputClass} placeholder="Skills (e.g. React, Node.js)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberInput value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min salary ($)" />
          <NumberInput value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max salary ($)" />
          <SelectWrapper value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </SelectWrapper>
        </div>

        {/* Active chips + actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={f.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                {f.label}
                <button type="button" onClick={f.clear} className="hover:text-accent-hover leading-none">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-full border border-border hover:border-text-disabled transition-colors"
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
