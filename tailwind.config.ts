import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        therapy: {
          // Main colorsnn
          primary: "#7C3AED",      // Vibrant purple
          secondary: "#06B6D4",    // Cyan
          tertiary: "#F59E0B",     // Warm amber
          
          // Gradients
          gradient: {
            start: "#7C3AED",
            mid: "#8B5CF6",
            end: "#06B6D4"
          },
          
          // Background colors
          background: "#0F172A",   // Deep blue-gray
          surface: "#1E293B",      // Lighter blue-gray
          card: "#334155",         // Card background
          hover: "#475569",        // Hover state
          
          // Text colors
          text: {
            primary: "#F8FAFC",    // Almost white
            secondary: "#CBD5E1",   // Light gray
            muted: "#94A3B8",      // Muted text
          },
          
          // Accent colors
          accent: {
            success: "#10B981",    // Green
            warning: "#F59E0B",    // Amber
            error: "#EF4444",      // Red
            info: "#3B82F6",       // Blue
          },
          
          // Border colors
          border: {
            light: "#475569",      // Lighter border
            dark: "#334155",       // Darker border
          }
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'wave1': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '16px' },
        },
        'wave2': {
          '0%, 100%': { height: '24px' },
          '50%': { height: '12px' },
        },
        'wave3': {
          '0%, 100%': { height: '12px' },
          '50%': { height: '20px' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'wave1': 'wave1 1.2s ease-in-out infinite',
        'wave2': 'wave2 1.2s ease-in-out infinite 0.1s',
        'wave3': 'wave3 1.2s ease-in-out infinite 0.2s',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      backgroundSize: {
        'gradient-animate': '200% 200%',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;