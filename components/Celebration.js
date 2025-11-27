import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

/**
 * Celebration Component
 * Shows confetti and celebration message for various game events
 *
 * Props:
 * - trigger: boolean to trigger celebration
 * - message: celebration message to display
 * - type: 'saint' | 'sinner' | 'winner' | 'correct' (determines colors)
 * - duration: how long to show celebration (ms)
 */
export default function Celebration({
  trigger = false,
  message = 'Congratulations!',
  type = 'winner',
  duration = 4000,
  onComplete,
}) {
  const [isActive, setIsActive] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);

      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete]);

  // Color schemes for different celebration types
  const colorSchemes = {
    saint: {
      colors: ['#00ED64', '#7FFFB2', '#00FFB2', '#00C853', '#FFFFFF'],
      gradient: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
      glow: '0 0 30px rgba(0, 237, 100, 0.8)',
    },
    sinner: {
      colors: ['#FF5C93', '#FFB3D9', '#FF2E7E', '#FF1493', '#FFFFFF'],
      gradient: 'linear-gradient(135deg, #FF5C93 0%, #FF2E7E 100%)',
      glow: '0 0 30px rgba(255, 92, 147, 0.8)',
    },
    winner: {
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00ED64', '#00FFB2', '#FFFFFF'],
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      glow: '0 0 40px rgba(255, 215, 0, 0.9)',
    },
    correct: {
      colors: ['#00ED64', '#7FFFB2', '#00FFB2', '#FFFFFF'],
      gradient: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
      glow: '0 0 25px rgba(0, 237, 100, 0.7)',
    },
  };

  const scheme = colorSchemes[type] || colorSchemes.winner;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Confetti */}
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={300}
            colors={scheme.colors}
            recycle={false}
            gravity={0.3}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          />

          {/* Celebration Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: 'spring',
                bounce: 0.5,
                duration: 0.8,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              y: 100,
              transition: { duration: 0.4 },
            }}
            style={{
              position: 'fixed',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                background: scheme.gradient,
                borderRadius: '24px',
                padding: '24px 48px',
                boxShadow: scheme.glow,
                border: '3px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  color: type === 'sinner' ? '#FFFFFF' : '#000000',
                  textAlign: 'center',
                  textShadow:
                    type === 'sinner'
                      ? '2px 2px 4px rgba(0, 0, 0, 0.5)'
                      : '2px 2px 4px rgba(255, 255, 255, 0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                {message}
              </Typography>
            </Box>
          </motion.div>

          {/* Pulsing background glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: scheme.gradient,
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
