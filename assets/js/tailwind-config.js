tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#0B1B3D",
            "primary-container": "#132B5E",
            "on-primary": "#ffffff",
            "on-primary-container": "#d7e2ff",
            "secondary": "#D4AF37",
            "secondary-container": "#F59E0B",
            "secondary-fixed": "#ffdeab",
            "on-secondary": "#1a1202",
            "tertiary": "#1B4332",
            "tertiary-container": "#0b2b1e",
            "surface": "#FFFFFF",
            "surface-container-lowest": "#ffffff",
            "surface-container-low": "#F8FAFC",
            "surface-container": "#F1F5F9",
            "surface-container-high": "#E2E8F0",
            "on-surface": "#0B1B3D",
            "on-surface-variant": "#475569",
            "outline": "#E2E8F0"
          },
          fontFamily: {
            serif: ["'Playfair Display'", "Georgia", "serif"],
            display: ["Poppins", "sans-serif"],
            sans: ["Poppins", "sans-serif"],
            mono: ["Poppins", "sans-serif"]
          },
          keyframes: {
            floatSlow: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-7px)' }
            },
            pulseGlow: {
              '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.15)' },
              '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.65), 0 0 45px rgba(212, 175, 55, 0.3)' }
            },
            shimmer: {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          },
          animation: {
            floatSlow: 'floatSlow 4.5s ease-in-out infinite',
            pulseGlow: 'pulseGlow 3s ease-in-out infinite'
          }
        }
      }
    };
