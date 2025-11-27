import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Chip } from '@mui/material';
import { RARITY_GRADIENTS } from '../utils/achievements';
import { playSound } from '../utils/sounds';

/**
 * Achievement Unlocked Notification
 * Shows a toast-style notification when an achievement is unlocked
 *
 * Props:
 * - achievement: achievement object { id, name, description, icon, rarity, points }
 * - onComplete: callback when animation completes
 */
export default function AchievementUnlocked({ achievement, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      playSound('correct'); // Achievement sound

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500); // Wait for exit animation
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10001,
            maxWidth: '400px',
          }}
        >
          <Box
            sx={{
              background: RARITY_GRADIENTS[achievement.rarity],
              borderRadius: '16px',
              padding: '16px 20px',
              boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 40px ${getRarityGlow(achievement.rarity)}`,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.7rem',
                  }}
                >
                  Achievement Unlocked
                </Typography>
                <Chip
                  label={achievement.rarity}
                  size="small"
                  sx={{
                    height: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#FFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
              </Box>

              {/* Achievement Details */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '3rem',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
                    }}
                  >
                    {achievement.icon}
                  </Box>
                </motion.div>

                {/* Text */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {achievement.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {achievement.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                    }}
                  >
                    +{achievement.points} points
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Particle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 50,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getRarityGlow(rarity) {
  const glows = {
    common: 'rgba(158, 158, 158, 0.3)',
    uncommon: 'rgba(76, 175, 80, 0.4)',
    rare: 'rgba(33, 150, 243, 0.5)',
    epic: 'rgba(156, 39, 176, 0.5)',
    legendary: 'rgba(255, 152, 0, 0.6)',
  };
  return glows[rarity] || glows.common;
}
