const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-base active:scale-[0.97]',
  secondary: 'bg-surface border border-border text-text-primary hover:border-accent hover:text-accent active:scale-[0.97]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface active:scale-[0.97]',
  danger: 'bg-danger/10 border border-danger/40 text-danger hover:bg-danger/20 active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-body',
  lg: 'px-6 py-3 text-body font-medium',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded font-medium
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
