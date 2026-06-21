import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getJobs, getStats } from '../api';

/* ── Icons ── */
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const DollarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BoltIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ── Company avatar ── */
function CompanyAvatar({ name, size = 'md' }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const hue = ((initial.charCodeAt(0) * 47) % 360);
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center shrink-0 font-bold border border-border/60`}
      style={{ background: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 75% 72%)` }}>
      {initial}
    </div>
  );
}

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) { el.classList.add('visible'); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', duration = 1600 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

/* ── Mini job preview card (hero) ── */
function HeroJobCard({ title, company, location, tag, delay }) {
  const hue = company.charCodeAt(0) * 47 % 360;
  return (
    <div className="animate-fade-in-up bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-card"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border border-border/60"
        style={{ background: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 75% 72%)` }}>
        {company[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary truncate">{title}</p>
        <p className="text-caption text-text-disabled truncate">{company} · {location}</p>
      </div>
      <span className="shrink-0 text-caption px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">{tag}</span>
    </div>
  );
}

/* ── Featured job card ── */
function FeaturedCard({ job, index }) {
  const company = job.employer?.companyName || job.employer?.name || 'Company';
  const salary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k` : null;
  const days = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const ago = days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`;
  const typeLabel = job.type ? job.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;

  return (
    <Link to={`/jobs/${job._id}`} className="block group">
      <div className="featured-card animate-fade-in-up bg-surface border border-border rounded-2xl p-5 h-full flex flex-col"
        style={{ animationDelay: `${500 + index * 80}ms` }}>
        <div className="flex items-start gap-3 mb-4">
          <CompanyAvatar name={company} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {job.title}
              </span>
              {typeLabel && (
                <span className="shrink-0 text-caption px-2 py-0.5 rounded-full bg-surface-raised text-text-secondary border border-border font-medium">
                  {typeLabel}
                </span>
              )}
            </div>
            <p className="text-caption text-text-secondary mt-0.5 truncate">{company}</p>
          </div>
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 3).map((s) => (
              <span key={s} className="text-caption px-2 py-0.5 rounded-lg bg-surface-raised text-text-secondary border border-border">{s}</span>
            ))}
            {job.skills.length > 3 && <span className="text-caption text-text-disabled">+{job.skills.length - 3}</span>}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between text-caption text-text-secondary pt-3 border-t border-border">
          <div className="flex items-center gap-3 flex-wrap">
            {job.location && <span className="flex items-center gap-1"><PinIcon />{job.location}</span>}
            {salary && <span className="flex items-center gap-1"><DollarIcon />{salary}</span>}
          </div>
          <span className="text-text-disabled shrink-0">{ago}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Testimonial card ── */
function Testimonial({ quote, name, role, hue }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400"><StarIcon /></span>)}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 75% 72%)` }}>
          {name[0]}
        </div>
        <div>
          <p className="text-xs font-semibold text-text-primary">{name}</p>
          <p className="text-caption text-text-disabled">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
export default function LandingPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ jobCount: null, employerCount: null });
  const statsRef    = useReveal();
  const stepsRef    = useReveal();
  const employerRef = useReveal();
  const testimonialsRef = useReveal();
  const ctaRef      = useReveal();

  useEffect(() => {
    getJobs({ limit: 4, status: 'active' }).then((r) => setJobs(r.data.jobs)).catch(() => {});
    getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative pt-16 pb-12 sm:pt-28 sm:pb-20">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="glow-orb w-80 h-80 sm:w-[500px] sm:h-[500px] animate-pulse-glow"
          style={{ background: 'rgba(99,102,241,0.1)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="glow-orb w-48 h-48 animate-float hidden sm:block"
          style={{ background: 'rgba(139,92,246,0.07)', top: '30%', left: '3%', animationDelay: '1s' }} />
        <div className="glow-orb w-40 h-40 animate-float hidden sm:block"
          style={{ background: 'rgba(99,102,241,0.09)', top: '20%', right: '3%', animationDelay: '2s' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-4">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <div className="animate-fade-in-up inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6"
              style={{ animationDelay: '0ms' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="text-caption text-text-secondary">
                {stats.jobCount != null ? `${stats.jobCount}+ jobs` : 'Jobs'} from top startups — updated daily
              </span>
            </div>

            <h1 className="animate-fade-in-up text-text-primary font-bold mb-5"
              style={{ animationDelay: '100ms', fontSize: 'clamp(2.2rem, 7vw, 3.75rem)', lineHeight: '1.06', letterSpacing: '-0.04em' }}>
              Find work that{' '}
              <span className="relative inline-block">
                <span className="text-accent">matters.</span>
                <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
              </span>
            </h1>

            <p className="animate-fade-in-up text-sm sm:text-body text-text-secondary max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed"
              style={{ animationDelay: '200ms' }}>
              Hirely connects ambitious people with the startups shaping the next decade.
              No noise, no spam — just the right opportunities.
            </p>

            <div className="animate-fade-in-up flex items-center justify-center lg:justify-start gap-3 flex-wrap mb-8"
              style={{ animationDelay: '300ms' }}>
              <Link to="/jobs"
                className="shine inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 active:scale-[0.97] shadow-glow">
                Find a job <ArrowIcon />
              </Link>
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border text-text-primary hover:border-accent/50 hover:text-accent font-medium px-6 py-3 rounded-full transition-all duration-200 active:scale-[0.97]">
                Post a job
              </Link>
            </div>

            <div className="animate-fade-in-up flex items-center justify-center lg:justify-start gap-3"
              style={{ animationDelay: '400ms' }}>
              <div className="flex -space-x-2">
                {['A','B','C','D','E'].map((l, i) => (
                  <div key={l} className="w-7 h-7 rounded-full border-2 border-base flex items-center justify-center text-caption font-bold"
                    style={{ background: `hsl(${i*60+200} 60% 25%)`, color: `hsl(${i*60+200} 80% 75%)`, zIndex: 5-i }}>
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-caption text-text-secondary">
                Join <span className="text-text-primary font-semibold">
                  {stats.employerCount != null ? `${stats.employerCount}+` : 'many'}
                </span> companies already hiring
              </span>
            </div>
          </div>

          {/* Right — floating job previews */}
          <div className="hidden lg:flex flex-col gap-3 max-w-sm ml-auto w-full">
            {jobs.slice(0, 4).map((job, i) => (
              <HeroJobCard
                key={job._id}
                title={job.title}
                company={job.employer?.companyName || job.employer?.name || 'Company'}
                location={job.location}
                tag={i === 0 ? 'New' : i === 1 ? 'Hot' : 'New'}
                delay={500 + i * 120}
              />
            ))}
            {jobs.length === 0 && (
              <>
                <HeroJobCard title="Senior Frontend Engineer" company="Your Company" location="Remote" tag="New" delay={500} />
                <HeroJobCard title="Product Designer" company="Your Company" location="Remote" tag="Hot" delay={620} />
                <HeroJobCard title="Backend Engineer" company="Your Company" location="Remote" tag="New" delay={740} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════ TRUSTED BY ══════════════ */}
      <section className="py-8 border-y border-border/50">
        <p className="text-caption text-text-disabled uppercase tracking-widest mb-5 font-medium text-center">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 px-4">
          {['Linear', 'Vercel', 'Notion', 'Supabase', 'Raycast', 'Anthropic', 'Figma'].map((name) => (
            <span key={name} className="text-sm font-semibold text-text-disabled hover:text-text-secondary transition-colors cursor-default select-none">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} className="reveal py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: stats.jobCount ?? 0, suffix: '+', label: 'Open roles', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            )},
            { value: stats.employerCount ?? 0, suffix: '+', label: 'Companies hiring', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            )},
            { value: jobs.length, suffix: '', label: 'New jobs today', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )},
            { value: 14, suffix: 'd', label: 'Avg. time to hire', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            )},
          ].map(({ value, suffix, label, icon }) => (
            <div key={label} className="bg-surface border border-border rounded-2xl p-5 sm:p-7 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                {icon}
              </div>
              <div>
                <div className="text-text-primary font-bold tabular-nums"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
                  <Counter target={value} suffix={suffix} />
                </div>
                <p className="text-caption text-text-secondary mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURED JOBS ══════════════ */}
      {jobs.length > 0 && (
        <section className="pb-14 sm:pb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-h2 text-text-primary">Featured opportunities</h2>
              <p className="text-sm text-text-secondary mt-0.5">Hand-picked roles from top companies</p>
            </div>
            <Link to="/jobs" className="hidden sm:flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors">
              View all <ArrowIcon />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {jobs.map((job, i) => <FeaturedCard key={job._id} job={job} index={i} />)}
          </div>
          <Link to="/jobs" className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm text-accent font-medium">
            View all jobs <ArrowIcon />
          </Link>
        </section>
      )}

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section ref={stepsRef} className="reveal py-14 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-accent text-caption font-semibold tracking-widest uppercase mb-3">
            <BoltIcon /> Simple process
          </div>
          <h2 className="text-h1 text-text-primary mb-3">Get hired in 3 steps</h2>
          <p className="text-sm sm:text-body text-text-secondary max-w-xs mx-auto">
            From browsing to offer letter in days, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
          <div className="hidden sm:block absolute top-8 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 pointer-events-none" />
          {[
            {
              n: '1', title: 'Discover roles',
              desc: 'Browse curated jobs from top startups. Filter by skills, salary, and location.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            },
            {
              n: '2', title: 'Apply in minutes',
              desc: 'One-click applications with your profile. No repetitive forms.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
            },
            {
              n: '3', title: 'Land the offer',
              desc: 'Get matched directly with hiring teams. Track every application in real time.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
            },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} className="relative flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0 bg-surface border border-border rounded-2xl p-5 sm:p-8 hover:border-accent/30 transition-colors duration-200">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  {icon}
                </div>
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-white text-caption font-bold flex items-center justify-center shadow-glow">
                  {n}
                </span>
              </div>
              <div className="sm:mt-6">
                <h3 className="text-sm sm:text-h3 font-semibold text-text-primary mb-1 sm:mb-2">{title}</h3>
                <p className="text-caption sm:text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FOR EMPLOYERS ══════════════ */}
      <section className="py-6 sm:py-10">
        <div ref={employerRef} className="reveal bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-7 sm:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-accent text-caption font-semibold tracking-widest uppercase mb-4">
                <BoltIcon /> For employers
              </div>
              <h2 className="text-text-primary font-bold mb-3 leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 2.25rem)', letterSpacing: '-0.03em' }}>
                Hire the best.<br />
                <span className="text-accent">Faster.</span>
              </h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-sm">
                Post a job in under 5 minutes and reach thousands of pre-vetted candidates actively looking for their next role.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register"
                  className="shine inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.97] shadow-glow">
                  Start hiring <ArrowIcon />
                </Link>
                <Link to="/jobs"
                  className="inline-flex items-center gap-2 border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 font-medium px-5 py-2.5 rounded-full transition-all duration-200">
                  See open roles
                </Link>
              </div>
            </div>

            <div className="p-7 sm:p-12 border-t lg:border-t-0 lg:border-l border-border flex flex-col justify-center gap-4">
              {[
                { title: 'Access 12k+ active candidates', desc: 'Reach developers, designers, and PMs actively searching right now.' },
                { title: 'Post in under 5 minutes',       desc: 'Streamlined job creation with smart defaults. No bloat.' },
                { title: 'Real-time applicant tracking',  desc: 'Review, filter, and move candidates through stages from one dashboard.' },
                { title: 'Direct communication',          desc: "No middlemen. Connect straight to candidates when they're hired." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5 text-accent">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{title}</p>
                    <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section ref={testimonialsRef} className="reveal py-14 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-accent text-caption font-semibold tracking-widest uppercase mb-3">
            <StarIcon /> Success stories
          </div>
          <h2 className="text-h2 text-text-primary">What our users say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Testimonial
            quote="Found my dream job at a Series B startup within 2 weeks. The filtering is incredibly precise — I only saw roles that actually matched my skills."
            name="Sarah K." role="Frontend Engineer" hue={220}
          />
          <Testimonial
            quote="We hired 3 engineers in one month. The applicant tracking dashboard saved us hours of back-and-forth emails every week."
            name="Marcus T." role="CTO at Flowline" hue={160}
          />
          <Testimonial
            quote="No spam, no recruiter calls. Just real jobs from companies that were actually excited to talk to me. That's rare."
            name="Priya M." role="Product Designer" hue={280}
          />
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-10 sm:py-16 mb-6">
        <div ref={ctaRef} className="reveal rounded-2xl p-8 sm:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(99,102,241,0.12) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="glow-orb w-72 h-72 animate-pulse-glow pointer-events-none"
            style={{ background: 'rgba(99,102,241,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-caption text-accent font-medium">
                Join {stats.employerCount != null ? `${stats.employerCount}+` : 'growing'} companies already hiring
              </span>
            </div>
            <h2 className="text-text-primary font-bold mb-3"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', letterSpacing: '-0.03em' }}>
              Your next role is waiting.
            </h2>
            <p className="text-sm sm:text-body text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
              It only takes a minute to get started. No credit card, no spam.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/jobs"
                className="shine inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 active:scale-[0.97] shadow-glow-lg">
                Browse all jobs <ArrowIcon />
              </Link>
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border/60 text-text-secondary hover:text-text-primary hover:border-accent/40 font-medium px-7 py-3 rounded-full transition-all duration-200">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
