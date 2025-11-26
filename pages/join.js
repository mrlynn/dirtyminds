import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { nanoid } from 'nanoid';
import { getPusherClient } from '../lib/pusher';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function JoinGame() {
  const router = useRouter();
  const { code } = router.query;

  const [gameCode, setGameCode] = useState(code || '');
  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => nanoid());
  const [joined, setJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState('');
  const [riddleNumber, setRiddleNumber] = useState(0);
  const [totalRiddles, setTotalRiddles] = useState(0);
  const [canBuzzIn, setCanBuzzIn] = useState(false);
  const [buzzedIn, setBuzzedIn] = useState(false);
  const [buzzResult, setBuzzResult] = useState(null); // 'winner', 'too-late', or null
  const [answer, setAnswer] = useState('');
  const [myScore, setMyScore] = useState(0);
  const [pusher, setPusher] = useState(null);

  useEffect(() => {
    if (code) {
      setGameCode(code.toUpperCase());
    }
  }, [code]);

  const handleJoinGame = () => {
    if (!gameCode || !playerName) return;

    const pusherClient = getPusherClient();
    setPusher(pusherClient);

    const channel = pusherClient.subscribe(`presence-game-${gameCode}`);

    // Authenticate with player info
    channel.bind('pusher:subscription_succeeded', () => {
      setJoined(true);
    });

    channel.bind('pusher:subscription_error', () => {
      alert('Could not join game. Check the game code.');
    });

    // Listen for game events
    channel.bind('client-game-started', (data) => {
      setGameStarted(true);
      setTotalRiddles(data.riddleCount);
      setRiddleNumber(1);
      setCanBuzzIn(true);
    });

    channel.bind('client-next-riddle', (data) => {
      setCurrentRiddle(data.riddle);
      setRiddleNumber(data.riddleIndex + 1);
      setCanBuzzIn(true);
      setBuzzedIn(false);
      setBuzzResult(null);
      setAnswer('');
    });

    channel.bind('client-buzz-result', (data) => {
      if (data.winner === playerId) {
        setBuzzResult('winner');
      } else {
        setBuzzResult('too-late');
      }
      setCanBuzzIn(false);
    });

    channel.bind('client-reveal-answer', (data) => {
      setAnswer(data.answer);
    });

    channel.bind('client-point-awarded', (data) => {
      if (data.playerId === playerId) {
        setMyScore(data.newScore);
      }
      setBuzzedIn(false);
      setBuzzResult(null);
    });

    channel.bind('client-game-over', () => {
      setCanBuzzIn(false);
    });

    // Send player info
    pusherClient.user = {
      id: playerId,
      info: {
        name: playerName,
      },
    };
  };

  const handleBuzzIn = () => {
    if (!canBuzzIn || buzzedIn) return;

    setBuzzedIn(true);

    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-buzz-in', {
        playerId,
        playerName,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <>
      <Head>
        <title>Join Game - Dirty Minds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Container maxWidth="sm">
        <Box sx={{ py: 4, minHeight: '100vh' }}>
          {!joined ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                  Join Game
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    variant="outlined"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                  />

                  <TextField
                    fullWidth
                    label="Game Code"
                    variant="outlined"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleJoinGame}
                    disabled={!gameCode || !playerName}
                  >
                    Join Game
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : !gameStarted ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', color: 'primary.main' }}>
                  Connected!
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>
                  Welcome, {playerName}
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Waiting for host to start the game...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {playerName}
                    </Typography>
                    <Chip label={`Score: ${myScore}`} color="primary" sx={{ fontWeight: 700 }} />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Riddle {riddleNumber} of {totalRiddles}
                    </Typography>
                    <Chip
                      label={canBuzzIn ? 'Active' : 'Waiting'}
                      color={canBuzzIn ? 'secondary' : 'default'}
                      size="small"
                    />
                  </Stack>

                  {buzzResult === 'winner' && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(0, 237, 100, 0.2)',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        You buzzed in first!
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Give your answer to the host
                      </Typography>
                    </Box>
                  )}

                  {buzzResult === 'too-late' && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(255, 92, 147, 0.2)',
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        Someone else buzzed in first
                      </Typography>
                    </Box>
                  )}

                  {answer && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                        Answer
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                        {answer}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleBuzzIn}
                    disabled={!canBuzzIn || buzzedIn}
                    startIcon={<TouchAppIcon />}
                    sx={{
                      py: 4,
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {buzzedIn ? 'Buzzed In!' : 'BUZZ IN'}
                  </Button>

                  {!canBuzzIn && !buzzResult && (
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                      Wait for the next riddle...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
