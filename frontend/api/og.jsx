import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Find work that matters').slice(0, 110);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 90);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0f',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 70%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: '40px', fontWeight: 700, color: 'white', letterSpacing: '-1px' }}>
            Hustl
          </span>
        </div>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {subtitle ? (
            <span style={{ fontSize: '32px', color: '#a5b4fc', fontWeight: 600 }}>{subtitle}</span>
          ) : null}
          <span style={{ fontSize: '64px', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            {title}
          </span>
        </div>

        {/* Footer */}
        <span style={{ fontSize: '26px', color: '#71717a' }}>hustl · find work that matters</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
