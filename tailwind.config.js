/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
        }
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
          '0%, 100%': { height: '4px' },
          '50%': { height: '12px' }
        },
        eq2: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '16px' }
        },
        eq3: {
          '0%, 100%': { height: '16px' },
          '50%': { height: '24px' }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
