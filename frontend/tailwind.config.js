/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'antique-gold': '#D4AF37',
        'antique-bronze': '#CD7F32',
        'antique-copper': '#B87333',
        'vintage-cream': '#F5F5DC',
        'vintage-brown': '#8B4513',
        'vintage-red': '#8B0000',
        'vintage-green': '#556B2F',
        'vintage-blue': '#2F4F4F',
        'vintage-gray': '#696969',
        'vintage-beige': '#F5F5DC',
        'vintage-mahogany': '#4E2728',
        'vintage-ivory': '#FFFFF0',
        'vintage-charcoal': '#36454F',
        'vintage-sage': '#9CAF88',
        'vintage-rose': '#E8B4B8',
        'vintage-navy': '#2C3E50',
        'vintage-terracotta': '#E2725B',
        'vintage-olive': '#6B8E23',
        'vintage-burgundy': '#800020',
        'vintage-amber': '#FFBF00'
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Crimson Text', 'serif'],
        'handwriting': ['Dancing Script', 'cursive']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' }
        }
      },
      backgroundImage: {
        'vintage-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23D4AF37\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'antique-texture': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.1\"/%3E%3C/svg%3E')"
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        antique: {
          "primary": "#D4AF37",
          "secondary": "#CD7F32",
          "accent": "#B87333",
          "neutral": "#2F4F4F",
          "base-100": "#FFFFF0",
          "base-200": "#F5F5DC",
          "base-300": "#E8E8E8",
          "info": "#2F4F4F",
          "success": "#556B2F",
          "warning": "#FFBF00",
          "error": "#8B0000",
        },
      },
      "light",
      "dark"
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
} 