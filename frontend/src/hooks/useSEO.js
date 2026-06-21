import { useEffect } from 'react';

const DEFAULTS = {
  title: 'Hustl — Find Work That Matters',
  description:
    'Hustl connects ambitious candidates with the startups shaping the next decade. Browse curated tech jobs, apply in minutes, and track every application in one place.',
};

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [key, val] = selector.replace('meta[', '').replace(']', '').split('=');
    el.setAttribute(key, val.replace(/["']/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Sets the document title + meta description + Open Graph tags for a page.
 * Restores the site defaults on unmount so SPA navigation stays correct.
 */
export default function useSEO({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Hustl` : DEFAULTS.title;
    const desc = description || DEFAULTS.description;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);

    return () => {
      document.title = DEFAULTS.title;
      setMeta('meta[name="description"]', 'content', DEFAULTS.description);
      setMeta('meta[property="og:title"]', 'content', DEFAULTS.title);
      setMeta('meta[property="og:description"]', 'content', DEFAULTS.description);
    };
  }, [title, description]);
}
