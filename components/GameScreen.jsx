import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Scoreboard from './Scoreboard';

const GameScreen = ({
  currentRiddle,
  riddleNumber,
  totalRiddles,
  showAnswer,
  players,
  onRevealAnswer,
  onNextRiddle,
  onAwardPoint,
  isLastRiddle,
}) => {
  return (
    <Box>
      <Scoreboard players={players} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Riddle {riddleNumber} of {totalRiddles}
            </Typography>
            <Chip
              label={showAnswer ? 'Answer Revealed' : 'Guess...'}
              color={showAnswer ? 'secondary' : 'default'}
              size="small"
            />
          </Stack>

          <Box
            sx={{
              p: 3,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              mb: 3,
              minHeight: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
              {currentRiddle.clue}
            </Typography>
          </Box>

          {showAnswer && (
            <Box
              sx={{
                p: 3,
                bgcolor: 'rgba(0, 237, 100, 0.1)',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase' }}>
                Answer
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {currentRiddle.answer}
              </Typography>
            </Box>
          )}

          <Stack spacing={2}>
            {!showAnswer ? (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={onRevealAnswer}
                startIcon={<VisibilityIcon />}
              >
                Reveal Answer
              </Button>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  Who got it right?
                </Typography>
                <Stack spacing={1}>
                  {players.map((player) => (
                    <Button
                      key={player.id}
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => onAwardPoint(player.id)}
                    >
                      +1 point to {player.name}
                    </Button>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={onNextRiddle}
                  endIcon={<NavigateNextIcon />}
                  sx={{ mt: 2 }}
                >
                  {isLastRiddle ? 'View Final Scores' : 'Next Riddle'}
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GameScreen;
