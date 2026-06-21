import { useState } from 'react';
import Input from '../ui/Input';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'];

const EMPTY = {
  title: '', description: '', location: '', type: 'full-time',
  skills: '', salaryMin: '', salaryMax: '',
};

const textareaClass = `w-full rounded-lg bg-base border px-3 py-2.5 text-body text-text-primary
  placeholder:text-text-disabled resize-y
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface
  transition-colors`;

const selectClass = `w-full rounded-lg bg-base border border-border px-3 py-2.5 text-body text-text-primary
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface
  transition-colors hover:border-text-disabled`;

export default function JobForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, skills: initial.skills?.join(', ') || '' });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.location.trim()) e.location = 'Location is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Job title" value={form.title} onChange={set('title')} error={errors.title} required />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-text-secondary font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={6}
          className={`${textareaClass} ${errors.description ? 'border-danger' : 'border-border hover:border-text-disabled'}`}
          placeholder="Describe the role, responsibilities, and what you're looking for…"
        />
        {errors.description && <p className="text-caption text-danger">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Location" value={form.location} onChange={set('location')} error={errors.location} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-secondary font-medium">Job type</label>
          <select value={form.type} onChange={set('type')} className={selectClass}>
            {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
      </div>

      <Input
        label="Skills (comma-separated)"
        placeholder="e.g. React, Node.js, MongoDB"
        value={form.skills}
        onChange={set('skills')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Min salary ($)" type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="e.g. 80000" />
        <Input label="Max salary ($)" type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="e.g. 120000" />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-accent hover:bg-accent-hover text-base font-medium py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
        >
          {loading ? 'Saving…' : 'Save job'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-full border border-border hover:border-accent/50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
