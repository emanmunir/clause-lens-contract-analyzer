/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legal-tech identity: deep slate ink + a trustworthy teal accent.
        ink: {
          50: '#f4f6f8',
          100: '#e6eaef',
          200: '#c9d2dc',
          300: '#a1b0c0',
          400: '#72879e',
          500: '#516a84',
          600: '#3f556d',
          700: '#344758',
          800: '#2d3c4b',
          900: '#1a2531',
          950: '#0f1720',
        },
        accent: {
          50: '#eefbf6',
          100: '#d6f5e8',
          200: '#b0ead4',
          300: '#7bd9ba',
          400: '#44c09b',
          500: '#1fa583',
          600: '#12856b',
          700: '#106a58',
          800: '#115447',
          900: '#0f463c',
          950: '#062822',
        },
        // Severity ramps
        high: {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          dot: '#dc2626',
        },
        medium: {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          dot: '#d97706',
        },
        low: {
          bg: '#f8fafc',
          border: '#e2e8f0',
          text: '#475569',
          dot: '#64748b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 32, 0.04), 0 1px 3px 0 rgba(15, 23, 32, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 32, 0.10), 0 2px 6px -2px rgba(15, 23, 32, 0.06)',
        panel: '0 8px 30px -8px rgba(15, 23, 32, 0.12)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
