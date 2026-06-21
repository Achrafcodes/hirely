import { next } from '@vercel/edge';

export const config = {
  matcher: ['/jobs/:path*', '/companies/:path*'],
};

const API = 'https://hirely-production-6725.up.railway.app/api';

// Social/link-preview crawlers that do not execute JavaScript.
const BOT_RE =
  /(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Slack-ImgProxy|WhatsApp|TelegramBot|Discordbot|Pinterest|redditbot|Embedly|quora link preview|Googlebot|bingbot|Applebot|vkShare|W3C_Validator|nuzzel|Bitrix|Skype|SkypeUriPreview|Iframely|Google-InspectionTool)/i;

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clamp(s = '', n) {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  // Real users get the normal SPA; only crawlers get pre-rendered meta.
  if (!BOT_RE.test(ua)) return next();

  const url = new URL(request.url);
  const origin = url.origin;
  const jobMatch = url.pathname.match(/^\/jobs\/([a-f0-9]{12,})$/i);
  const companyMatch = url.pathname.match(/^\/companies\/([a-f0-9]{12,})$/i);

  let title = '';
  let description = '';
  let subtitle = '';

  try {
    if (jobMatch) {
      const r = await fetch(`${API}/jobs/${jobMatch[1]}`);
      if (r.ok) {
        const { job } = await r.json();
        const company = job.employer?.companyName || job.employer?.name || 'A company';
        title = `${job.title} at ${company}`;
        subtitle = company;
        description = clamp(
          `${company} is hiring a ${job.title}${job.location ? ` in ${job.location}` : ''}. ${job.description || ''}`,
          200
        );
      }
    } else if (companyMatch) {
      const r = await fetch(`${API}/companies/${companyMatch[1]}`);
      if (r.ok) {
        const { company, jobs } = await r.json();
        const name = company.companyName || company.name;
        const count = Array.isArray(jobs) ? jobs.length : 0;
        title = name;
        subtitle = `${count} open role${count !== 1 ? 's' : ''}`;
        description = clamp(
          `${name} is hiring on Hustl — ${count} open role${count !== 1 ? 's' : ''}${company.location ? ` in ${company.location}` : ''}. ${company.companyDesc || ''}`,
          200
        );
      }
    }
  } catch {
    // fall through to default
  }

  // Unknown id / fetch failed → let the SPA handle it.
  if (!title) return next();

  const ogUrl = origin + url.pathname;
  const image = `${origin}/api/og?title=${encodeURIComponent(clamp(title, 110))}&subtitle=${encodeURIComponent(clamp(subtitle, 90))}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — Hustl</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(ogUrl)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Hustl" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(ogUrl)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body>
<h1>${esc(title)}</h1>
<p>${esc(description)}</p>
<a href="${esc(ogUrl)}">View on Hustl</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
