import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, LinearProgress } from '@mui/material';
import { playSound } from '../utils/sounds';

/**
 * Animated Timer Component
 * Countdown timer with visual and audio feedback
 *
 * Props:
 * - duration: total time in seconds
 * - onComplete: callback when timer reaches 0
 * - onTick: optional callback on each second
 * - paused: if true, timer is paused
 * - warningThreshold: seconds remaining to trigger warning (default 10)
 */
export default function Timer({
  duration = 30,
  onComplete,
  onTick,
  paused = false,
  warningThreshold = 10,
}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (paused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Trigger callbacks
        if (onTick) onTick(newTime);
        if (newTime === 0 && onComplete) onComplete();

        // Warning states
        if (newTime === warningThreshold) {
          setIsWarning(true);
        }
        if (newTime === 5) {
          setIsCritical(true);
          playSound('click');
        }
        if (newTime <= 3 && newTime > 0) {
          playSound('click');
        }

        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, timeRemaining, duration, onComplete, onTick, warningThreshold]);

  const progress = (timeRemaining / duration) * 100;
  const isExpired = timeRemaining === 0;

  // Color based on time remaining
  const getColor = () => {
    if (isExpired) return '#757575';
    if (isCritical) return '#FF1744';
    if (isWarning) return '#FFA726';
    return '#00ED64';
  };

  const getGradient = () => {
    if (isExpired) return 'linear-gradient(135deg, #757575 0%, #9E9E9E 100%)';
    if (isCritical) return 'linear-gradient(135deg, #FF1744 0%, #FF5252 100%)';
    if (isWarning) return 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)';
    return 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '400px',
        mx: 'auto',
      }}
    >
      {/* Timer Display */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <motion.div
          animate={
            isCritical
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={
            isCritical
              ? {
                  duration: 1,
                  repeat: Infinity,
                }
              : {}
          }
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
            }}
          >
            {/* Circular background */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: getGradient(),
                opacity: 0.2,
              }}
            />

            {/* Pulsing glow when critical */}
            {isCritical && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: getColor(),
                  filter: 'blur(15px)',
                }}
              />
            )}

            {/* Time text */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 900,
                  color: getColor(),
                  textShadow: `0 0 20px ${getColor()}`,
                  lineHeight: 1,
                }}
              >
                {formatTime(timeRemaining)}
              </Typography>
              {paused && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  PAUSED
                </Typography>
              )}
            </Box>

            {/* Circular progress */}
            <svg
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)',
              }}
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke={getColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 55}`}
                initial={{ strokeDashoffset: 0 }}
                animate={{
                  strokeDashoffset: (2 * Math.PI * 55 * (100 - progress)) / 100,
                }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </Box>
        </motion.div>
      </Box>

      {/* Progress Bar */}
      <Box
        sx={{
          width: '100%',
          height: 8,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: getGradient(),
            borderRadius: 4,
            boxShadow: `0 0 10px ${getColor()}`,
          }}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Warning indicator */}
        {isWarning && (
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: getGradient(),
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      {/* Status text */}
      {isExpired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              textAlign: 'center',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: '#FF1744',
              textTransform: 'uppercase',
            }}
          >
            Time's Up!
          </Typography>
        </motion.div>
      )}
    </Box>
  );
}
