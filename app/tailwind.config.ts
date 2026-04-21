import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1440px' } },
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        cn: ['"Noto Sans SC"', '"Plus Jakarta Sans"', 'ui-sans-serif'],
      },
      colors: {
        // Brand teal
        brand: { 50:'#EAFBFA',100:'#C7F4F1',200:'#8CE6E2',300:'#44C9C1',400:'#1CA7A0',500:'#0E8A85',600:'#0A6F6B',700:'#08524F',800:'#043736',900:'#022523' },
        // Navy canvas
        navy: { 50:'#F3F7FC',100:'#DCE6F2',200:'#B3C5DE',300:'#7A98C1',400:'#4A6D9D',500:'#024F94',600:'#023D75',700:'#022C57',800:'#011D3C',900:'#010F22' },
        // Cool gray
        gray: { 50:'#F8FAFC',100:'#E6EDF6',200:'#C6D2E0',300:'#9AA8BA',400:'#6C7A90',500:'#4A596E',600:'#35445A',700:'#232F44',800:'#15203A',900:'#0B1327' },
        // Semantic (keep Tailwind-compatible names)
        success: { 500:'#22C55E', 600:'#16A34A' },
        warning: { 500:'#F59E0B', 600:'#D97706' },
        danger: { 500:'#EF4444', 600:'#DC2626' },
        info: { 500:'#3B82F6', 600:'#2563EB' },
        // Semantic aliases → CSS variables (light/dark swap)
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-elev': 'rgb(var(--bg-elev) / <alpha-value>)',
        'bg-elev-2': 'rgb(var(--bg-elev-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
        text: { DEFAULT: 'rgb(var(--text) / <alpha-value>)', muted: 'rgb(var(--text-muted) / <alpha-value>)', faint: 'rgb(var(--text-faint) / <alpha-value>)' },
        accent: { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', hover: 'rgb(var(--accent-hover) / <alpha-value>)' },
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
      borderRadius: { xs: '4px', sm: '6px', md: '10px', lg: '14px', xl: '20px' },
      boxShadow: {
        xs: '0 1px 2px rgb(2 15 34 / 0.08)',
        sm: '0 2px 4px rgb(2 15 34 / 0.10), 0 1px 2px rgb(2 15 34 / 0.06)',
        md: '0 6px 16px rgb(2 15 34 / 0.14), 0 2px 4px rgb(2 15 34 / 0.06)',
        lg: '0 16px 32px rgb(2 15 34 / 0.18), 0 4px 8px rgb(2 15 34 / 0.08)',
        xl: '0 24px 48px rgb(2 15 34 / 0.24), 0 8px 16px rgb(2 15 34 / 0.12)',
        glow: '0 0 0 1px rgb(28 167 160 / 1), 0 0 20px rgb(68 201 193 / 0.35)',
        inset: 'inset 0 1px 2px rgb(2 15 34 / 0.15)',
      },
      transitionTimingFunction: {
        'in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-smooth': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'shimmer': { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'pulse-dot': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out-smooth',
        'slide-up': 'slide-up 220ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        'shimmer': 'shimmer 1.8s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
