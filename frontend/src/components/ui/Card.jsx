export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-surface rounded shadow-card border border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
