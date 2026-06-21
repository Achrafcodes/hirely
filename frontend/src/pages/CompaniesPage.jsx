import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../api';
import useSEO from '../hooks/useSEO';

const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

function CompanyAvatar({ name }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 font-bold text-text-primary text-lg">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function CompaniesPage() {
  useSEO({ title: 'Companies', description: 'Browse companies hiring on Hirely and explore their open roles.' });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCompanies()
      .then((r) => setCompanies(r.data.companies))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary">Companies</h1>
        <p className="text-body text-text-secondary mt-1">
          {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} hiring now
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-danger mb-2">Something went wrong</p>
          <p className="text-sm text-text-secondary">Please refresh and try again.</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-xl border border-border">
          <p className="text-h3 text-text-disabled mb-1">No companies yet</p>
          <p className="text-sm text-text-secondary">Check back once employers start posting roles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {companies.map((c) => {
            const name = c.companyName || c.name;
            return (
              <Link key={c._id} to={`/companies/${c._id}`} className="block group">
                <div className="featured-card bg-surface rounded-xl border border-border shadow-card p-5 h-full">
                  <div className="flex items-start gap-3">
                    <CompanyAvatar name={name} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                        {name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {c.location && (
                          <span className="flex items-center gap-1 text-caption text-text-secondary">
                            <PinIcon /> {c.location}
                          </span>
                        )}
                        <span className="text-caption text-accent font-medium">
                          {c.jobCount} open role{c.jobCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {c.companyDesc && (
                        <p className="text-caption text-text-secondary mt-2 line-clamp-2">{c.companyDesc}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
