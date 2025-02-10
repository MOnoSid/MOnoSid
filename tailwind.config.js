/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
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
        therapy: {
          background: '#EBF4FA',  // Light sky blue background
          surface: '#F7FBFD',     // Very light blue surface
          'border-light': '#B8D8E8',  // Soft blue border
          'text-primary': '#2B4F71',  // Deep sky blue text
          'text-muted': '#6B93BC',    // Muted sky blue text
          'gradient-start': '#87CEEB', // Sky blue start
          'gradient-end': '#B0E2FF',   // Light sky blue end
          secondary: '#A7D2E8',        // Soft sky blue
          tertiary: '#C5E3F2',         // Lighter sky blue
          card: '#F0F8FF',             // Alice blue card background
          'hover': '#DCF0FA',          // Hover state blue
          'active': '#B8E2F2',         // Active state blue
          'button': '#87CEEB',         // Button blue
          'button-text': '#FFFFFF',    // Button text white
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slower': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slowest': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        "eq1": "eq1 0.8s ease-in-out infinite",
        "eq2": "eq2 0.8s ease-in-out infinite",
        "eq3": "eq3 0.8s ease-in-out infinite"
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: 0,
          },
        },
        eq1: {
          '0%, 100%': { height: '0.5rem' },
          '50%': { height: '1.5rem' },
        },
        eq2: {
          '0%, 100%': { height: '1rem' },
          '50%': { height: '2rem' },
        },
        eq3: {
          '0%, 100%': { height: '0.75rem' },
          '50%': { height: '1.75rem' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
