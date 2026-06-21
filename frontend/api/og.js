import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Minimal hyperscript so we can avoid JSX (which Vercel does not auto-detect
// as a function for non-Next projects).
function h(type, props, ...children) {
  return {
    $$typeof: Symbol.for('react.element'),
    type,
    key: null,
    ref: null,
    props: {
      ...(props || {}),
      children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
    },
  };
}

export default function handler(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Find work that matters').slice(0, 110);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 90);

  const tree = h(
    'div',
    {
      style: {
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
      },
    },
    // Brand row
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '18px' } },
      h(
        'div',
        {
          style: {
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 800,
            color: 'white',
          },
        },
        'H'
      ),
      h(
        'span',
        { style: { fontSize: '40px', fontWeight: 700, color: 'white', letterSpacing: '-1px' } },
        'Hustl'
      )
    ),
    // Title block
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
      subtitle
        ? h('span', { style: { fontSize: '32px', color: '#a5b4fc', fontWeight: 600 } }, subtitle)
        : h('span', { style: { display: 'none' } }, ''),
      h(
        'span',
        {
          style: {
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
          },
        },
        title
      )
    ),
    // Footer
    h('span', { style: { fontSize: '26px', color: '#71717a' } }, 'hustl · find work that matters')
  );

  return new ImageResponse(tree, { width: 1200, height: 630 });
}
