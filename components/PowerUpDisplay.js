import { motion } from 'framer-motion';
import { Box, Typography, IconButton, Tooltip, Badge } from '@mui/material';
import { POWERUPS } from '../utils/powerups';

/**
 * Power-Up Display Component
 * Shows available power-ups and allows activation
 *
 * Props:
 * - powerUps: { powerupId: count }
 * - activePowerUps: { powerupId: roundsRemaining }
 * - onUsePowerUp: (powerupId) => void
 * - compact: if true, shows smaller version
 */
export default function PowerUpDisplay({
  powerUps = {},
  activePowerUps = {},
  onUsePowerUp,
  compact = false,
}) {
  const hasPowerUps = Object.keys(powerUps).length > 0 || Object.keys(activePowerUps).length > 0;

  if (!hasPowerUps) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 1 : 2,
        p: compact ? 1 : 2,
        background: 'rgba(11, 16, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {!compact && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Power-Ups
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Available power-ups */}
        {Object.entries(powerUps).map(([powerupId, count]) => {
          if (count === 0) return null;

          const powerup = POWERUPS[powerupId];
          if (!powerup) return null;

          const isActive = activePowerUps[powerupId] > 0;

          return (
            <Tooltip
              key={powerupId}
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {powerup.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    {powerup.description}
                  </Typography>
                  {isActive && (
                    <Typography variant="caption" sx={{ color: '#00ED64', fontWeight: 600 }}>
                      Active! ({activePowerUps[powerupId]} rounds left)
                    </Typography>
                  )}
                </Box>
              }
              arrow
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          `0 0 0px ${powerup.color}`,
                          `0 0 20px ${powerup.color}`,
                          `0 0 0px ${powerup.color}`,
                        ],
                      }
                    : {}
                }
                transition={
                  isActive
                    ? {
                        duration: 2,
                        repeat: Infinity,
                      }
                    : {}
                }
              >
                <Badge
                  badgeContent={count}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #00ED64 0%, #00FFB2 100%)',
                      color: '#000',
                      fontWeight: 700,
                    },
                  }}
                >
                  <IconButton
                    onClick={() => onUsePowerUp && onUsePowerUp(powerupId)}
                    disabled={isActive}
                    sx={{
                      width: compact ? 48 : 64,
                      height: compact ? 48 : 64,
                      background: isActive ? powerup.gradient : 'rgba(255, 255, 255, 0.1)',
                      border: `2px solid ${isActive ? powerup.color : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '12px',
                      fontSize: compact ? '1.5rem' : '2rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: powerup.gradient,
                        borderColor: powerup.color,
                        boxShadow: `0 0 20px ${powerup.color}60`,
                      },
                      '&:disabled': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    {powerup.icon}
                  </IconButton>
                </Badge>
              </motion.div>
            </Tooltip>
          );
        })}

        {/* Active power-ups (that aren't in inventory) */}
        {Object.entries(activePowerUps).map(([powerupId, roundsRemaining]) => {
          if (powerUps[powerupId] > 0) return null; // Already shown above

          const powerup = POWERUPS[powerupId];
          if (!powerup) return null;

          return (
            <Tooltip
              key={powerupId}
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {powerup.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    {powerup.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00ED64', fontWeight: 600 }}>
                    Active! ({roundsRemaining} rounds left)
                  </Typography>
                </Box>
              }
              arrow
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    `0 0 0px ${powerup.color}`,
                    `0 0 20px ${powerup.color}`,
                    `0 0 0px ${powerup.color}`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Box
                  sx={{
                    width: compact ? 48 : 64,
                    height: compact ? 48 : 64,
                    background: powerup.gradient,
                    border: `2px solid ${powerup.color}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: compact ? '1.5rem' : '2rem',
                    position: 'relative',
                  }}
                >
                  {powerup.icon}

                  {/* Rounds remaining indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      background: '#000',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${powerup.color}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: powerup.color,
                      }}
                    >
                      {roundsRemaining}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
