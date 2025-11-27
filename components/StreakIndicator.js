import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

/**
 * Streak Indicator Component
 * Shows player's current win streak with visual flair
 *
 * Props:
 * - streak: current streak count
 * - role: 'SAINT' or 'SINNER' (for color theming)
 * - compact: if true, shows smaller version
 */
export default function StreakIndicator({ streak = 0, role = 'SAINT', compact = false }) {
  if (streak === 0) return null;

  const getStreakData = (streakCount) => {
    if (streakCount >= 7) {
      return {
        label: 'GODLIKE',
        icon: '💫',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        glow: '0 0 30px rgba(255, 215, 0, 0.8)',
      };
    } else if (streakCount >= 5) {
      return {
        label: 'UNSTOPPABLE',
        icon: '⚡',
        color: '#FF6B00',
        gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF8E00 100%)',
        glow: '0 0 25px rgba(255, 107, 0, 0.7)',
      };
    } else if (streakCount >= 3) {
      return {
        label: 'ON FIRE',
        icon: '🔥',
        color: '#FF3D00',
        gradient: 'linear-gradient(135deg, #FF3D00 0%, #FF6E40 100%)',
        glow: '0 0 20px rgba(255, 61, 0, 0.6)',
      };
    }
    return null;
  };

  const streakData = getStreakData(streak);

  // Simple streak counter
  if (!streakData) {
    const roleColor = role === 'SAINT' ? '#00ED64' : '#FF5C93';
    const roleGradient =
      role === 'SAINT'
        ? 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)'
        : 'linear-gradient(135deg, #FF5C93 0%, #FF2E7E 100%)';

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: compact ? 1 : 1.5,
            py: compact ? 0.5 : 0.75,
            background: roleGradient,
            borderRadius: compact ? '12px' : '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 4px 12px ${roleColor}40`,
          }}
        >
          <Typography
            variant={compact ? 'caption' : 'body2'}
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: '#000',
              fontSize: compact ? '0.7rem' : '0.85rem',
            }}
          >
            {streak} Win Streak
          </Typography>
        </Box>
      </motion.div>
    );
  }

  // Special streak indicator
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {/* Pulsing glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            right: -5,
            bottom: -5,
            background: streakData.gradient,
            borderRadius: compact ? '16px' : '20px',
            filter: 'blur(10px)',
            zIndex: 0,
          }}
        />

        {/* Main badge */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems: 'center',
            gap: compact ? 1 : 0.5,
            px: compact ? 2 : 3,
            py: compact ? 1 : 2,
            background: streakData.gradient,
            borderRadius: compact ? '14px' : '18px',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            boxShadow: streakData.glow,
          }}
        >
          {/* Icon with animation */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Box
              sx={{
                fontSize: compact ? '1.5rem' : '2.5rem',
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
              }}
            >
              {streakData.icon}
            </Box>
          </motion.div>

          {/* Label */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant={compact ? 'caption' : 'h6'}
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                letterSpacing: '1px',
                fontSize: compact ? '0.65rem' : '1rem',
              }}
            >
              {streakData.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: compact ? '0.6rem' : '0.75rem',
              }}
            >
              {streak} in a row!
            </Typography>
          </Box>
        </Box>

        {/* Particle effects */}
        {!compact &&
          [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8) * 40,
                y: Math.sin((i * Math.PI * 2) / 8) * 40,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                repeatDelay: 1,
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: streakData.color,
                pointerEvents: 'none',
              }}
            />
          ))}
      </Box>
    </motion.div>
  );
}
