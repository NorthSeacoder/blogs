import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,md,mdx,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        muted: '#6b7280',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
