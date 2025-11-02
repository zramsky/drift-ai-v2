/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 12-column responsive grid system
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 56px
        'h1-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 72px for larger screens
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 36px
        'h3': ['1.75rem', { lineHeight: '1.4', fontWeight: '600' }], // 28px
        'body-lg': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }], // 20px
        'body': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
      },
      colors: {
        // DRIFT.AI Light Theme Color System
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // DRIFT.AI Brand Colors - Light Theme
        'brand-orange': '#FF6B35', // Primary orange/coral accent
        'brand-steel': '#4682B4', // Kept for legacy compatibility
        'brand-gold': '#D4A017', // Kept for legacy compatibility
        // DRIFT.AI Semantic Colors
        success: {
          DEFAULT: '#22C55E',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#ffffff',
        },
        error: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: '#60A5FA',
          foreground: '#ffffff',
        },
        // DRIFT.AI Surface Colors - Light Theme
        'surface-primary': '#FFFFFF', // White primary surface
        'surface-secondary': '#F8F9FA', // Very light gray
        'surface-tertiary': '#F5F5F5', // Light gray
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'drift': '0.75rem', // 12px as specified
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'focus-ring': '0 0 0 2px #FF6B35',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}