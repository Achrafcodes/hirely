export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-text-secondary font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded bg-surface border px-3 py-2 text-body text-text-primary
          placeholder:text-text-disabled
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-base
          ${error ? 'border-danger' : 'border-border hover:border-text-disabled'}
        `}
        {...props}
      />
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
