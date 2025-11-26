import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Box,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const SetupScreen = ({ players, onAddPlayer, onRemovePlayer, onStartGame }) => {
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      onAddPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
          Dirty Minds
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Add Players
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPlayer}
              sx={{ minWidth: 60 }}
            >
              <PersonAddIcon />
            </Button>
          </Stack>

          {players.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Players ({players.length})
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {players.map((player) => (
                  <Chip
                    key={player.id}
                    label={player.name}
                    onDelete={() => onRemovePlayer(player.id)}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          onClick={onStartGame}
          disabled={players.length < 2}
          startIcon={<PlayArrowIcon />}
        >
          Start Game
        </Button>

        {players.length < 2 && (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
            Add at least 2 players to start
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SetupScreen;
