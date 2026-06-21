import { useState } from 'react';
import toast from 'react-hot-toast';

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ShareButton({ title, text, label = 'Share', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;

    // Native share sheet (mostly mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user dismissed
        // otherwise fall through to copy
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share"
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border transition-all duration-150 active:scale-95 ${
        copied
          ? 'text-success border-success/40 bg-success/10'
          : 'text-text-secondary border-border hover:text-text-primary hover:bg-surface-raised'
      } ${className}`}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
      {label && <span className="text-sm font-medium">{copied ? 'Copied' : label}</span>}
    </button>
  );
}
