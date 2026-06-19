const statusStyles = {
  applied: 'bg-accent/10 text-accent border-accent/20',
  reviewed: 'bg-warning/10 text-warning border-warning/20',
  interview: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-danger/10 text-danger border-danger/20',
  hired: 'bg-success/20 text-success border-success/30',
  active: 'bg-success/10 text-success border-success/20',
  closed: 'bg-text-disabled/10 text-text-disabled border-text-disabled/20',
};

const typeStyles = {
  'full-time': 'bg-surface-raised text-text-secondary border-border',
  'part-time': 'bg-surface-raised text-text-secondary border-border',
  contract: 'bg-surface-raised text-text-secondary border-border',
  remote: 'bg-accent/10 text-accent border-accent/20',
};

export default function Badge({ children, status, type, className = '' }) {
  const style = status
    ? (statusStyles[status] ?? 'bg-surface-raised text-text-secondary border-border')
    : type
    ? (typeStyles[type] ?? 'bg-surface-raised text-text-secondary border-border')
    : 'bg-surface-raised text-text-secondary border-border';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize ${style} ${className}`}
    >
      {children}
    </span>
  );
}
