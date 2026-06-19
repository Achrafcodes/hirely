import { Link } from 'react-router-dom';

const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const socials = [
  { label: 'X / Twitter', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'LinkedIn',    d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { label: 'GitHub',      d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
];

const cols = [
  { heading: 'Product', items: [{ label: 'Find Jobs', to: '/jobs' }, { label: 'Post a Job', to: '/register' }, { label: 'Dashboard', to: '/dashboard/candidate' }, { label: 'Profile', to: '/profile' }] },
  { heading: 'Company', items: [{ label: 'About', to: '/' }, { label: 'Blog', to: '/' }, { label: 'Careers', to: '/jobs' }, { label: 'Press', to: '/' }] },
  { heading: 'Legal',   items: [{ label: 'Privacy', to: '/' }, { label: 'Terms', to: '/' }, { label: 'Cookie Policy', to: '/' }, { label: 'Contact', to: '/' }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-base mt-4">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Top grid */}
        <div className="py-10 sm:py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand — full width on xs, 1 col on sm+ */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
                <BoltIcon />
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">Hirely</span>
            </Link>
            <p className="text-caption text-text-secondary leading-relaxed max-w-[200px]">
              Connecting ambitious people with the startups shaping the next decade.
            </p>
            <div className="flex gap-2 mt-5">
              {socials.map(({ label, d }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-disabled hover:text-text-secondary hover:border-accent/40 transition-all duration-150">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(({ heading, items }) => (
            <div key={heading}>
              <p className="text-caption font-semibold text-text-primary uppercase tracking-widest mb-4">{heading}</p>
              <ul className="flex flex-col gap-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-caption text-text-disabled">© {new Date().getFullYear()} Hirely, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-caption text-text-disabled">
            <span>Built with</span>
            <span className="text-accent">♥</span>
            <span>for job seekers everywhere</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
