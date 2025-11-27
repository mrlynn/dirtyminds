import { createTheme } from '@mui/material/styles';

// Enhanced theme with gradients, glassmorphism, and visual polish
const themeEnhanced = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ED64',
      light: '#7FFFB2',
      dark: '#00C853',
      gradient: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
    },
    secondary: {
      main: '#FF5C93',
      light: '#FFB3D9',
      dark: '#FF2E7E',
      gradient: 'linear-gradient(135deg, #FF5C93 0%, #FF2E7E 100%)',
    },
    background: {
      default: '#050810',
      paper: '#0B101A',
      card: 'linear-gradient(135deg, #0B101A 0%, #1A1F2E 100%)',
      overlay: 'rgba(5, 8, 16, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Space Grotesk", "Roboto", sans-serif',
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(11, 16, 26, 0.8) 0%, rgba(26, 31, 46, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
          boxShadow: '0 4px 20px rgba(0, 237, 100, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00FFB2 0%, #00ED64 100%)',
            boxShadow: '0 6px 30px rgba(0, 237, 100, 0.6)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FF5C93 0%, #FF2E7E 100%)',
          boxShadow: '0 4px 20px rgba(255, 92, 147, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF2E7E 0%, #FF5C93 100%)',
            boxShadow: '0 6px 30px rgba(255, 92, 147, 0.6)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, rgba(0, 237, 100, 0.2) 0%, rgba(0, 255, 178, 0.2) 100%)',
          border: '1px solid rgba(0, 237, 100, 0.5)',
          color: '#00ED64',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, rgba(255, 92, 147, 0.2) 0%, rgba(255, 46, 126, 0.2) 100%)',
          border: '1px solid rgba(255, 92, 147, 0.5)',
          color: '#FF5C93',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(11, 16, 26, 0.6)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(11, 16, 26, 0.8)',
            },
            '&.Mui-focused': {
              background: 'rgba(11, 16, 26, 0.9)',
              boxShadow: '0 0 20px rgba(0, 237, 100, 0.3)',
            },
          },
        },
      },
    },
  },
});

// Custom utility styles
export const customStyles = {
  glassCard: {
    background: 'linear-gradient(135deg, rgba(11, 16, 26, 0.7) 0%, rgba(26, 31, 46, 0.7) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  saintGlow: {
    boxShadow: '0 0 20px rgba(0, 237, 100, 0.4), 0 0 40px rgba(0, 237, 100, 0.2)',
  },
  sinnerGlow: {
    boxShadow: '0 0 20px rgba(255, 92, 147, 0.4), 0 0 40px rgba(255, 92, 147, 0.2)',
  },
  shimmer: {
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      animation: 'shimmer 2s infinite',
    },
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
  pulseGlow: {
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  '@keyframes pulse-glow': {
    '0%, 100%': {
      boxShadow: '0 0 20px rgba(0, 237, 100, 0.4)',
    },
    '50%': {
      boxShadow: '0 0 40px rgba(0, 237, 100, 0.8)',
    },
  },
};

// Animation presets for Framer Motion
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  cardFlip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.5,
        duration: 0.8,
      },
    },
  },
};

// Stagger children animation
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default themeEnhanced;
