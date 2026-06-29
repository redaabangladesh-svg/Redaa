import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          primary: "var(--color-primary)",
          "primary-alt": "var(--color-primary-alt)",
          secondary: "var(--color-secondary)",
          "secondary-dark": "var(--color-secondary-dark)",
          "secondary-light": "var(--color-secondary-light)",
          accent: "var(--color-accent)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        bangla: ["var(--font-bangla)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
