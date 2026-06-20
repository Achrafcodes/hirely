import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up">
        <p className="text-8xl font-bold text-accent/20 mb-4 select-none" style={{ letterSpacing: '-0.05em' }}>404</p>
        <h1 className="text-h2 text-text-primary mb-2">Page not found</h1>
        <p className="text-body text-text-secondary mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/" className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.97]">
            Go home
          </Link>
          <Link to="/jobs" className="border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 font-medium px-6 py-2.5 rounded-full transition-all duration-150">
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
