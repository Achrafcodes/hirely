/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:            '#0A0A0B',
        surface:         '#141415',
        'surface-raised':'#1C1C1E',
        border:          '#27272A',
        accent:          '#6366F1',
        'accent-hover':  '#4F46E5',
        'text-primary':  '#F4F4F5',
        'text-secondary':'#A1A1AA',
        'text-disabled': '#52525B',
        success:         '#16A34A',
        warning:         '#B45309',
        danger:          '#B91C1C',
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.04em', fontWeight: '700' }],
        h1:      ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
        h2:      ['1.5rem',  { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '600' }],
        h3:      ['1.125rem',{ lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        body:    ['0.9375rem',{ lineHeight: '1.6', letterSpacing: '0' }],
        sm:      ['0.8125rem',{ lineHeight: '1.5', letterSpacing: '0' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        none: '0',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        modal:      '0 8px 32px rgba(0,0,0,0.6)',
        glow:       '0 0 40px rgba(99,102,241,0.15)',
        'glow-lg':  '0 0 80px rgba(99,102,241,0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulse_glow: { '0%,100%': { opacity: '0.6', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.05)' } },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.55s ease forwards',
        'float':       'float 4s ease-in-out infinite',
        'pulse-glow':  'pulse_glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
