import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * Animated Score Popup
 * Shows floating score changes with animations
 *
 * Props:
 * - points: number of points gained
 * - multiplier: optional multiplier (e.g., 2x, 3x)
 * - message: optional message (e.g., "Perfect!", "Streak Bonus!")
 * - color: color of the popup (defaults to green)
 * - onComplete: callback when animation completes
 */
export default function ScorePopup({
  points = 0,
  multiplier = 1,
  message = '',
  color = '#00ED64',
  onComplete,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (points > 0) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [points, onComplete]);

  const totalPoints = points * multiplier;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{ y: -80, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            opacity: { duration: 0.3 },
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10002,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 800,
                    color: color,
                    textShadow: `0 0 20px ${color}, 2px 2px 4px rgba(0, 0, 0, 0.8)`,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '1.2rem',
                  }}
                >
                  {message}
                </Typography>
              </motion.div>
            )}

            {/* Points */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 900,
                    color: color,
                    textShadow: `0 0 30px ${color}, 4px 4px 8px rgba(0, 0, 0, 0.8)`,
                    fontSize: '4rem',
                    lineHeight: 1,
                  }}
                >
                  +{totalPoints}
                </Typography>
              </motion.div>

              {/* Multiplier badge */}
              {multiplier > 1 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    bounce: 0.6,
                    delay: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      borderRadius: '12px',
                      border: '3px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 900,
                        color: '#000',
                        textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {multiplier}x
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </Box>

            {/* Sparkle particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 12) * (50 + Math.random() * 30),
                  y: Math.sin((i * Math.PI * 2) / 12) * (50 + Math.random() * 30),
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  top: message ? '60%' : '50%',
                  left: '50%',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
