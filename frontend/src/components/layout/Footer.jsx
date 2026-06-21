import { Link } from 'react-router-dom';

const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const socials = [
  { label: 'LinkedIn',  href: 'https://ma.linkedin.com/in/achraf-essoussy-570679219', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { label: 'Instagram', href: 'https://www.instagram.com/achrafcodes/', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { label: 'GitHub',    href: 'https://github.com/Achrafcodes', d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
];

const cols = [
  { heading: 'Product', items: [{ label: 'Find Jobs', to: '/jobs' }, { label: 'Post a Job', to: '/register' }, { label: 'Dashboard', to: '/dashboard/candidate' }, { label: 'Profile', to: '/profile' }] },
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
              <span className="text-sm font-semibold text-text-primary tracking-tight">Hustl</span>
            </Link>
            <p className="text-caption text-text-secondary leading-relaxed max-w-[200px]">
              Connecting ambitious people with the startups shaping the next decade.
            </p>
            <div className="flex gap-2 mt-5">
              {socials.map(({ label, href, d }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
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
          <p className="text-caption text-text-disabled">© {new Date().getFullYear()} Hustl. All rights reserved.</p>
          <div className="flex items-center gap-1 text-caption text-text-disabled">
            <span>Built with</span>
            <span className="text-accent">♥</span>
            <span>for job seekers everywhere by</span>
            <a
              href="https://github.com/Achrafcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors font-medium"
            >
              achrafcodes
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
