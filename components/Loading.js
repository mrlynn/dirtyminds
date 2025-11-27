import { motion } from 'framer-motion';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Component
 * Shows animated loading state with optional message
 *
 * Props:
 * - message: optional loading message
 * - fullScreen: if true, takes full screen
 * - size: size of loading spinner (small, medium, large)
 */
export default function Loading({
  message = 'Loading...',
  fullScreen = true,
  size = 'large',
}) {
  const sizes = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const spinnerSize = sizes[size] || sizes.large;

  const Container = fullScreen ? Box : motion.div;

  const containerProps = fullScreen
    ? {
        sx: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #050810 0%, #0B101A 100%)',
          zIndex: 9999,
        },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        },
      };

  return (
    <Container {...containerProps}>
      {/* Animated Spinner Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring',
            bounce: 0.5,
            duration: 0.6,
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {/* Outer glow ring */}
          <motion.div
            animate={{
              rotate: 360,
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            style={{
              position: 'absolute',
              top: -10,
              left: -10,
              width: spinnerSize + 20,
              height: spinnerSize + 20,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00ED64 0%, #FF5C93 100%)',
                opacity: 0.3,
                filter: 'blur(10px)',
              }}
            />
          </motion.div>

          {/* Main spinner */}
          <CircularProgress
            size={spinnerSize}
            thickness={4}
            sx={{
              color: '#00ED64',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />

          {/* Pulsing center dot */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
                  boxShadow: '0 0 20px rgba(0, 237, 100, 0.6)',
                }}
              />
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Loading Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.3,
              duration: 0.5,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mt: 4,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>

          {/* Animated dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}
    </Container>
  );
}
