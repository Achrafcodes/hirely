import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getJobs } from '../api';

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

/* ── Company avatar ── */
function CompanyAvatar({ name }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const hue = ((initial.charCodeAt(0) * 47) % 360);
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm border border-border/60"
      style={{ background: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 75% 72%)` }}>
      {initial}
    </div>
  );
}

/* ── Scroll reveal — shows immediately if already in viewport ── */
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

/* ── Featured job card ── */
function FeaturedCard({ job, index }) {
  const company = job.employer?.companyName || job.employer?.name || 'Company';
  const salary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k` : null;
  const days = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const ago = days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`;

  return (
    <Link to={`/jobs/${job._id}`} className="block group">
      <div className="featured-card animate-fade-in-up bg-surface border border-border rounded-2xl p-5 h-full"
        style={{ animationDelay: `${500 + index * 80}ms` }}>
        <div className="flex items-start gap-3 mb-4">
          <CompanyAvatar name={company} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {job.title}
              </span>
              <span className="shrink-0 text-caption px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                Featured
              </span>
            </div>
            <p className="text-caption text-text-secondary mt-0.5 truncate">{company}</p>
          </div>
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 3).map((s) => (
              <span key={s} className="text-caption px-2 py-0.5 rounded-lg bg-surface-raised text-text-secondary border border-border">{s}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-caption text-text-secondary pt-3 border-t border-border">
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

/* ──────────────────────────────────────── */
export default function LandingPage() {
  const [jobs, setJobs] = useState([]);
  const statsRef  = useReveal();
  const stepsRef  = useReveal();
  const employerRef = useReveal();
  const ctaRef    = useReveal();

  useEffect(() => {
    getJobs({ limit: 4, status: 'active' }).then((r) => setJobs(r.data.jobs)).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        {/* Gradient bg */}
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        {/* Glow orb */}
        <div className="glow-orb w-72 h-72 sm:w-96 sm:h-96 animate-pulse-glow"
          style={{ background: 'rgba(99,102,241,0.12)', top: '-80px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="glow-orb w-48 h-48 animate-float hidden sm:block"
          style={{ background: 'rgba(139,92,246,0.08)', top: '30%', left: '5%', animationDelay: '1s' }} />
        <div className="glow-orb w-40 h-40 animate-float hidden sm:block"
          style={{ background: 'rgba(99,102,241,0.1)', top: '20%', right: '5%', animationDelay: '2s' }} />

        <div className="relative z-10 px-4">
          {/* Social proof pill */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6 sm:mb-8"
            style={{ animationDelay: '0ms' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-caption text-text-secondary">2,400+ jobs from top startups — updated daily</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up text-text-primary font-bold mb-4 sm:mb-5"
            style={{ animationDelay: '100ms', fontSize: 'clamp(2rem, 8vw, 3.5rem)', lineHeight: '1.08', letterSpacing: '-0.04em' }}>
            Find work that{' '}
            <span className="text-accent relative">
              matters.
              <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up text-sm sm:text-body text-text-secondary max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed"
            style={{ animationDelay: '200ms' }}>
            Hirely connects ambitious people with the startups shaping the next decade.
            No noise, no spam — just the right opportunities.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up flex items-center justify-center gap-3 flex-wrap"
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

          {/* Social proof avatars */}
          <div className="animate-fade-in-up flex items-center justify-center gap-3 mt-8"
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
              Join <span className="text-text-primary font-semibold">12,000+</span> candidates already hired
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURED JOBS ══════════════ */}
      {jobs.length > 0 && (
        <section className="pb-14 sm:pb-20">
          <div className="flex items-center justify-between mb-5">
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

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} className="reveal py-8 sm:py-12 my-2 rounded-2xl bg-surface border border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-6 sm:px-10">
          {[
            { value: 2400, suffix: '+', label: 'Open roles' },
            { value: 500,  suffix: '+', label: 'Companies hiring' },
            { value: 98,   suffix: '%', label: 'Placement rate' },
            { value: 14,   suffix: 'd', label: 'Avg. time to hire' },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <div className="text-text-primary font-bold tabular-nums mb-1"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 3rem)', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
                <Counter target={value} suffix={suffix} />
              </div>
              <p className="text-caption text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

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
          {/* connector line – desktop only */}
          <div className="hidden sm:block absolute top-6 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />

          {[
            {
              n: '1', title: 'Discover roles',
              desc: 'Browse thousands of curated jobs from top-tier startups and scale-ups. Filter by skills, salary, and location.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
            },
            {
              n: '2', title: 'Apply in minutes',
              desc: 'One-click applications with your profile. No repetitive forms — your info is already there.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
            },
            {
              n: '3', title: 'Land the offer',
              desc: 'Get matched directly with hiring teams. Track every application in real time.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              ),
            },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} className="relative flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0 bg-surface border border-border rounded-2xl p-5 sm:p-8">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  {icon}
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-caption font-bold flex items-center justify-center">
                  {n}
                </span>
              </div>
              <div className="sm:mt-5">
                <h3 className="text-sm sm:text-h3 font-semibold text-text-primary mb-1 sm:mb-2">{title}</h3>
                <p className="text-caption sm:text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FOR EMPLOYERS ══════════════ */}
      <section className="py-6 sm:py-12">
        <div ref={employerRef} className="reveal bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left */}
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

            {/* Right */}
            <div className="p-7 sm:p-12 border-t lg:border-t-0 lg:border-l border-border flex flex-col justify-center gap-4">
              {[
                { title: 'Access 12k+ active candidates',  desc: 'Reach developers, designers, and PMs actively searching right now.' },
                { title: 'Post in under 5 minutes',        desc: 'Streamlined job creation with smart defaults. No bloat.' },
                { title: 'Real-time applicant tracking',   desc: 'Review, filter, and move candidates through stages from one dashboard.' },
                { title: 'Direct communication',           desc: "No middlemen. Connect straight to candidates when they're hired." },
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

      {/* ══════════════ TRUSTED BY ══════════════ */}
      <section className="py-10 text-center">
        <p className="text-caption text-text-disabled uppercase tracking-widest mb-6 font-medium">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4">
          {['Linear', 'Vercel', 'Notion', 'Supabase', 'Raycast', 'Anthropic', 'Figma'].map((name) => (
            <span key={name} className="text-sm font-semibold text-text-disabled hover:text-text-secondary transition-colors cursor-default select-none">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-10 sm:py-16 mb-6">
        <div ref={ctaRef} className="reveal rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(99,102,241,0.12) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="glow-orb w-64 h-64 animate-pulse-glow pointer-events-none"
            style={{ background: 'rgba(99,102,241,0.1)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div className="relative z-10">
            <h2 className="text-text-primary font-bold mb-3"
              style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', letterSpacing: '-0.03em' }}>
              Your next role is waiting.
            </h2>
            <p className="text-sm sm:text-body text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
              Join thousands of professionals who found their dream job through Hirely.
              It only takes a minute to get started.
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
