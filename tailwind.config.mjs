/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.{css,scss}"
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arapey: ['Arapey', 'serif'],
        jost: ['Jost', 'sans-serif'],
        work: ['Work Sans', 'sans-serif'],
        // satoshi → handled by style.css @theme + satoshi.css local fonts
        // mulish  → not used in any tsx file
      },
      colors: {
        // ===== CORE DESIGN TOKENS =====
        // Used by shadcn/ui components - reference CSS variables from globals.css
        border: "oklch(var(--border))",
        background: "var(--background)",
        foreground: "oklch(var(--foreground))",

        // ===== PUBLIC SITE COLORS =====

        // General purpose colors for public pages
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e7eb",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      // ===== PUBLIC SITE ANIMATIONS =====
      animation: {
        'scroll-left': 'scroll-left 30s linear infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
