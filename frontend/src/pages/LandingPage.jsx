import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getJobs, getStats } from '../api';
import useSEO from '../hooks/useSEO';

/* ── Icons ── */
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const DollarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

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
  useEffect(() => {
    if (!target) return;
    const el = ref.current;
    const animate = () => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!el) { animate(); return; }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { animate(); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { animate(); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

/* ── Live job card (replaces hero mockups) ── */
function LiveJobCard({ job, index }) {
  const company = job.employer?.companyName || job.employer?.name || 'Company';
  const hue = company.charCodeAt(0) * 47 % 360;
  const salary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k` : null;

  return (
    <Link to={`/jobs/${job._id}`} className="block group">
      <div
        className="featured-card animate-fade-in-up bg-surface border border-border rounded-lg p-4 flex items-center gap-3"
        style={{ animationDelay: `${400 + index * 100}ms` }}
      >
        <div
          className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0 text-sm font-medium border border-border/60"
          style={{ background: `hsl(${hue} 40% 18%)`, color: `hsl(${hue} 60% 65%)` }}
        >
          {company[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{job.title}</p>
          <p className="font-mono text-caption text-text-secondary uppercase truncate mt-0.5">{company}{job.location ? ` · ${job.location}` : ''}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {job.type && (
            <span className="font-mono text-caption uppercase bg-surface-raised text-text-secondary border border-border px-2 py-0.5 rounded-sm">
              {job.type.replace(/-/g, ' ')}
            </span>
          )}
          {salary && <span className="font-mono text-caption text-text-disabled">{salary}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── Testimonial ── */
function Testimonial({ quote, name, role, hue }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <span key={i} className="text-accent"><StarIcon /></span>)}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium shrink-0"
          style={{ background: `hsl(${hue} 40% 18%)`, color: `hsl(${hue} 60% 65%)` }}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="font-mono text-caption text-text-disabled uppercase">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
export default function LandingPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ jobCount: null, employerCount: null });
  useSEO();
  const statsRef        = useReveal();
  const stepsRef        = useReveal();
  const employerRef     = useReveal();
  const testimonialsRef = useReveal();
  const ctaRef          = useReveal();

  useEffect(() => {
    getJobs({ limit: 3, status: 'active' }).then((r) => setJobs(r.data.jobs)).catch(() => {});
    getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center px-4">

          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <div
              className="animate-fade-in-up inline-flex items-center gap-2 bg-surface border border-border px-3 py-1 mb-8 rounded-sm"
              style={{ animationDelay: '0ms' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span className="font-mono text-caption text-text-secondary uppercase">
                {stats.jobCount != null ? `${stats.jobCount}+ roles` : 'Curated roles'} — updated daily
              </span>
            </div>

            <h1
              className="animate-fade-in-up font-display text-text-primary mb-6"
              style={{ animationDelay: '80ms', fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', lineHeight: '1.05' }}
            >
              The job board for{' '}
              <em className="italic text-accent not-italic" style={{ fontStyle: 'italic' }}>serious</em>
              {' '}engineers.
            </h1>

            <p
              className="animate-fade-in-up text-body text-text-secondary max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed"
              style={{ animationDelay: '160ms', fontSize: '17px' }}
            >
              Hustl connects ambitious people with the startups shaping the next decade.
              Not every job — just the right ones.
            </p>

            <div
              className="animate-fade-in-up flex items-center justify-center lg:justify-start gap-3 flex-wrap"
              style={{ animationDelay: '240ms' }}
            >
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-base font-medium px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.97]"
              >
                Browse jobs <ArrowIcon />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-transparent border border-border text-text-secondary hover:border-accent hover:text-accent font-medium px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.97]"
              >
                Post a job
              </Link>
            </div>

            <div className="animate-fade-in-up mt-10 flex items-center justify-center lg:justify-start gap-4" style={{ animationDelay: '320ms' }}>
              <span className="font-mono text-caption text-text-disabled uppercase">Hiring from</span>
              <div className="flex items-center gap-4 flex-wrap">
                {['Linear', 'Vercel', 'Supabase', 'Figma'].map((name) => (
                  <span key={name} className="text-sm font-medium text-text-disabled hover:text-text-secondary transition-colors cursor-default">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — live job cards */}
          <div className="flex flex-col gap-2.5 max-w-sm mx-auto lg:mx-0 lg:ml-auto w-full">
            {jobs.slice(0, 3).map((job, i) => (
              <LiveJobCard key={job._id} job={job} index={i} />
            ))}
            {jobs.length === 0 && [
              { _id: '1', title: 'Senior Frontend Engineer', employer: { companyName: 'Acme Corp' }, location: 'Remote', type: 'full-time' },
              { _id: '2', title: 'Product Designer', employer: { companyName: 'BuildCo' }, location: 'San Francisco', type: 'contract' },
              { _id: '3', title: 'Backend Engineer', employer: { companyName: 'DevStudio' }, location: 'Remote', type: 'full-time' },
            ].map((job, i) => (
              <LiveJobCard key={job._id} job={job} index={i} />
            ))}
            <Link
              to="/jobs"
              className="mt-1 text-center font-mono text-caption text-text-disabled hover:text-accent uppercase tracking-wider transition-colors"
            >
              View all {stats.jobCount != null ? `${stats.jobCount}+` : ''} open roles →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} className="reveal border-y border-border py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {[
            { value: stats.jobCount ?? 0, suffix: '+', label: 'Open roles' },
            { value: stats.employerCount ?? 0, suffix: '+', label: 'Companies hiring' },
            { value: 14, suffix: 'd', label: 'Avg. time to hire' },
            { value: 94, suffix: '%', label: 'Response rate' },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="bg-base px-6 py-8 sm:py-10 text-center">
              <div className="text-text-primary font-medium tabular-nums mb-1"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', lineHeight: '1.1' }}>
                <Counter target={value} suffix={suffix} />
              </div>
              <p className="font-mono text-caption text-text-secondary uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section ref={stepsRef} className="reveal py-16 sm:py-24">
        <div className="mb-12">
          <p className="font-mono text-caption text-accent uppercase mb-3">Simple process</p>
          <h2 className="font-sans text-h1 font-medium text-text-primary">Get hired in 3 steps</h2>
          <p className="text-body text-text-secondary mt-2 max-w-sm">
            From browsing to offer letter in days, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              n: '01', title: 'Discover roles',
              desc: 'Browse curated jobs from top startups. Filter by skills, salary, and location.',
            },
            {
              n: '02', title: 'Apply in minutes',
              desc: 'One-click applications with your profile resume. No repetitive forms.',
            },
            {
              n: '03', title: 'Land the offer',
              desc: 'Get matched directly with hiring teams. Track every application in real time.',
            },
          ].map(({ n, title, desc }) => (
            <div key={n} className="featured-card bg-surface border border-border rounded-lg p-6 sm:p-8">
              <p className="font-mono text-caption text-accent uppercase mb-5">{n}</p>
              <h3 className="text-h3 font-medium text-text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FOR EMPLOYERS ══════════════ */}
      <section className="py-6 sm:py-10">
        <div ref={employerRef} className="reveal bg-surface rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border">
              <p className="font-mono text-caption text-accent uppercase mb-4">For employers</p>
              <h2 className="font-sans text-text-primary font-medium mb-4 leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}>
                Hire the best.<br />Faster.
              </h2>
              <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-sm">
                Post a job in under 5 minutes and reach thousands of pre-vetted candidates actively looking for their next role.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-base font-medium px-5 py-2.5 rounded-md transition-all duration-150 active:scale-[0.97]">
                  Start hiring <ArrowIcon />
                </Link>
                <Link to="/jobs"
                  className="inline-flex items-center gap-2 border border-border text-text-secondary hover:border-accent hover:text-accent font-medium px-5 py-2.5 rounded-md transition-all duration-150">
                  See open roles
                </Link>
              </div>
            </div>

            <div className="p-8 sm:p-12 flex flex-col justify-center gap-5">
              {[
                { title: 'Access 12k+ active candidates', desc: 'Reach developers, designers, and PMs actively searching right now.' },
                { title: 'Post in under 5 minutes',       desc: 'Streamlined job creation with smart defaults. No bloat.' },
                { title: 'Real-time applicant tracking',  desc: 'Review, filter, and move candidates through stages from one dashboard.' },
                { title: 'Direct communication',          desc: "No middlemen. Connect straight to candidates when they're hired." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-5 h-5 rounded-sm bg-accent-dim border border-accent/30 flex items-center justify-center shrink-0 mt-0.5 text-accent-text">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{title}</p>
                    <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section ref={testimonialsRef} className="reveal py-16 sm:py-24">
        <div className="mb-10">
          <p className="font-mono text-caption text-accent uppercase mb-3">Success stories</p>
          <h2 className="font-sans text-h1 font-medium text-text-primary">What our users say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            name="Priya M." role="Product Designer" hue={45}
          />
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-10 sm:py-16 mb-6">
        <div ref={ctaRef} className="reveal bg-surface border border-border rounded-lg p-10 sm:p-16 text-center">
          <p className="font-mono text-caption text-accent uppercase mb-4">Ready?</p>
          <h2 className="font-sans text-text-primary font-medium mb-4"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}>
            Your next role is waiting.
          </h2>
          <p className="text-body text-text-secondary max-w-sm mx-auto mb-10 leading-relaxed">
            It only takes a minute to get started. No credit card, no spam.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/jobs"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-base font-medium px-7 py-3 rounded-md transition-all duration-150 active:scale-[0.97]">
              Browse all jobs <ArrowIcon />
            </Link>
            <Link to="/register"
              className="inline-flex items-center gap-2 border border-border text-text-secondary hover:border-accent hover:text-accent font-medium px-7 py-3 rounded-md transition-all duration-150">
              Create account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
