import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./src/**/*.{astro,html,md,mdx,js,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 保留原有颜色
        primary: '#2563eb',
        muted: '#6b7280',
        // 语义化颜色（CSS 变量驱动）
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
      },
      backgroundColor: {
        glass: 'var(--glass-bg)',
        'glass-hover': 'var(--glass-bg-hover)',
      },
      borderColor: {
        glass: 'var(--glass-border)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    typography,
    // 自定义 animation-fill-mode 工具类
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.animate-fill-none': { 'animation-fill-mode': 'none' },
        '.animate-fill-forwards': { 'animation-fill-mode': 'forwards' },
        '.animate-fill-backwards': { 'animation-fill-mode': 'backwards' },
        '.animate-fill-both': { 'animation-fill-mode': 'both' },
      });
    }),
  ],
} satisfies Config;
