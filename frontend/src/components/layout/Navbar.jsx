import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navLinkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
    isActive
      ? 'text-accent bg-accent/10 font-medium'
      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const dashboardPath = user?.role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate';

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/'); };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-base/80 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105">
                <BoltIcon />
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">Hustl</span>
            </Link>

            {/* Desktop center nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              <NavLink to="/jobs" className={navLinkClass}>Find Jobs</NavLink>
              <NavLink to="/companies" className={navLinkClass}>Companies</NavLink>
              <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-all duration-150">
                Employers
              </Link>
              {user && <NavLink to={dashboardPath} className={navLinkClass}>Dashboard</NavLink>}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-all duration-150 active:scale-90">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              {user ? (
                <>
                  <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                  <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-all duration-150">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
                    Sign in
                  </Link>
                  <Link to="/register" className="shine inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-150 active:scale-[0.97]">
                    Post a job
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: theme + burger */}
            <div className="flex md:hidden items-center gap-1">
              <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-raised transition-all active:scale-90">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-raised transition-all active:scale-90">
                {open ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-base/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-14 right-0 bottom-0 z-40 w-72 bg-surface border-l border-border flex flex-col md:hidden
        transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 border-b border-border">
          <NavLink to="/jobs" className={({ isActive }) =>
            `px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-surface-raised'}`}>
            Find Jobs
          </NavLink>
          <NavLink to="/companies" className={({ isActive }) =>
            `px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-surface-raised'}`}>
            Companies
          </NavLink>
          <Link to="/register" className="px-4 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-surface-raised transition-all">
            Employers
          </Link>
          {user && (
            <NavLink to={dashboardPath} className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-surface-raised'}`}>
              Dashboard
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-surface-raised'}`}>
              Profile
            </NavLink>
          )}
        </nav>

        {/* Auth actions */}
        <div className="p-4 flex flex-col gap-3">
          {user ? (
            <button onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm font-medium text-danger border border-danger/30 hover:bg-danger/10 transition-all">
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login"
                className="w-full py-3 rounded-xl text-sm font-medium text-center text-text-primary border border-border hover:bg-surface-raised transition-all">
                Sign in
              </Link>
              <Link to="/register"
                className="w-full py-3 rounded-full text-sm font-semibold text-center bg-accent hover:bg-accent-hover text-white transition-all active:scale-[0.98]">
                Post a job
              </Link>
            </>
          )}
        </div>

        {/* Bottom info */}
        <div className="mt-auto p-4 border-t border-border">
          <p className="text-caption text-text-disabled text-center">© {new Date().getFullYear()} Hustl, Inc.</p>
        </div>
      </div>
    </>
  );
}
