const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function GoogleButton({ role = 'candidate', label = 'Continue with Google' }) {
  const handleClick = () => {
    window.location.href = `${BACKEND}/api/auth/google?role=${role}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-border bg-surface hover:bg-surface-raised text-sm font-medium text-text-primary transition-all duration-150 active:scale-[0.97]"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.2 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
        <path fill="#FBBC05" d="M10.6 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.1-6.2z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-8.1 6.2C6.6 42.5 14.7 48 24 48z"/>
      </svg>
      {label}
    </button>
  );
}
