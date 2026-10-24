import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic theme CSS variable mappings
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        focus: 'var(--color-focus)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',

        // Named palette tokens
        ivory: '#F2F2F2',
        ink: '#0F0F09',
        sage: '#C4CEB8',
        stone: '#585E5F',
        earth: '#453F22',
        slate: '#9EA9B2',
        taupe: '#8D7658',
        bronze: '#B17D58',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
        md: ['1rem', { lineHeight: '1.5rem' }],          // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.16' }],         // 48px
        hero: ['clamp(2.5rem, 5vw + 1rem, 4rem)', { lineHeight: '1.1' }], // 64px max
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 15, 9, 0.05)',
        md: '0 4px 16px rgba(15, 15, 9, 0.07)',
        lg: '0 12px 32px rgba(15, 15, 9, 0.10)',
      },
      maxWidth: {
        content: '1440px',
        reading: '760px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
      transitionDuration: {
        fast: '140ms',
        normal: '220ms',
        slow: '360ms',
      },
    },
  },
  plugins: [],
};

export default config;
