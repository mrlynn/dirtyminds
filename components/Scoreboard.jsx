import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Scoreboard = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topScore = sortedPlayers[0]?.score || 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          Scoreboard
        </Typography>
        <Stack spacing={2}>
          {sortedPlayers.map((player, index) => (
            <Stack
              key={player.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 2,
                bgcolor: player.score === topScore && topScore > 0 ? 'rgba(0, 237, 100, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: player.score === topScore && topScore > 0 ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {player.score === topScore && topScore > 0 && (
                  <EmojiEventsIcon sx={{ color: 'primary.main' }} />
                )}
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {player.name}
                </Typography>
              </Stack>
              <Chip
                label={player.score}
                color={player.score === topScore && topScore > 0 ? 'primary' : 'default'}
                sx={{ fontWeight: 700, minWidth: 50 }}
              />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
