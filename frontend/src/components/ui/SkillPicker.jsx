import { useState, useRef, useEffect } from 'react';

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Next.js', 'Node.js',
  'Express', 'Python', 'Django', 'FastAPI', 'Go', 'Rust', 'Java', 'Spring Boot',
  'PHP', 'Laravel', 'Ruby', 'Rails', 'C#', '.NET', 'Swift', 'Kotlin',
  'React Native', 'Flutter', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'CI/CD', 'Git', 'Linux', 'Figma', 'Tailwind CSS', 'SQL', 'Elasticsearch',
  'Terraform', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
];

export default function SkillPicker({ value = [], onChange, max = 15 }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = SUGGESTED_SKILLS.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s)
  );

  const canAddCustom =
    query.trim().length > 1 &&
    !value.includes(query.trim()) &&
    !SUGGESTED_SKILLS.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  const add = (skill) => {
    if (value.length >= max) return;
    onChange([...value, skill]);
    setQuery('');
    inputRef.current?.focus();
  };

  const remove = (skill) => onChange(value.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) add(filtered[0]);
      else if (canAddCustom) add(query.trim());
    }
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      remove(value[value.length - 1]);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-accent-dim text-accent-text border border-accent/30 font-mono text-caption uppercase tracking-wide"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="text-accent-text/60 hover:text-accent-text ml-0.5 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-inset border border-border focus-within:border-accent transition-colors cursor-text"
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Search or type a skill…' : 'Add more…'}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled outline-none min-w-0"
        />
        {value.length > 0 && (
          <span className="font-mono text-[11px] text-text-disabled flex-shrink-0">{value.length}/{max}</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (query.length > 0 || filtered.length > 0) && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-lg shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.slice(0, 8).map((skill) => (
            <button
              key={skill}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); add(skill); }}
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-raised transition-colors"
            >
              {skill}
            </button>
          ))}
          {canAddCustom && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); add(query.trim()); }}
              className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-surface-raised transition-colors border-t border-border"
            >
              Add "<span className="font-medium">{query.trim()}</span>"
            </button>
          )}
          {filtered.length === 0 && !canAddCustom && (
            <p className="px-3 py-2 text-sm text-text-disabled">No matches</p>
          )}
        </div>
      )}
    </div>
  );
}
