import React, { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, Typography, Button, Stack, Chip } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { nanoid } from 'nanoid';
import PusherClient from 'pusher-js';
import riddlesData from '../data/riddles';
import Scoreboard from '../components/Scoreboard';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

export default function HostGame() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [hostId] = useState(() => nanoid());
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [riddles, setRiddles] = useState([]);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);
  const [pusher, setPusher] = useState(null);
  const [currentReaderIndex, setCurrentReaderIndex] = useState(0);

  useEffect(() => {
    // Create game
    const createGame = async () => {
      const code = nanoid(6).toUpperCase();
      setGameCode(code);

      // Initialize Pusher with host auth
      const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: '/api/pusher/auth',
        auth: {
          params: {
            user_id: hostId,
            user_info: JSON.stringify({ name: 'Host', isHost: true }),
          },
        },
      });

      setPusher(pusherClient);

      const channel = pusherClient.subscribe(`presence-game-${code}`);

      // Listen for player joins
      channel.bind('pusher:member_added', (member) => {
        setPlayers((prev) => {
          if (prev.find((p) => p.id === member.id)) return prev;
          return [...prev, { id: member.id, name: member.info.name, score: 0 }];
        });
      });

      // Listen for player leaves
      channel.bind('pusher:member_removed', (member) => {
        setPlayers((prev) => prev.filter((p) => p.id !== member.id));
      });

      // Listen for buzz-ins
      channel.bind('client-buzz-in', (data) => {
        if (!buzzedPlayer) {
          setBuzzedPlayer(data.playerId);
          // Notify all clients who buzzed in first
          channel.trigger('client-buzz-result', {
            winner: data.playerId,
            playerName: data.playerName,
          });
        }
      });
    };

    createGame();

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartGame = () => {
    const shuffledRiddles = shuffleArray(riddlesData);
    setRiddles(shuffledRiddles);
    setGameStarted(true);
    setCurrentRiddleIndex(0);
    setCurrentReaderIndex(0);
    setShowAnswer(false);

    // Notify all players game started with first riddle
    if (pusher && players.length > 0) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-game-started', {
        riddleCount: riddlesData.length,
        firstRiddle: shuffledRiddles[0].clue,
        readerId: players[0].id,
        readerName: players[0].name,
      });
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-reveal-answer', {
        answer: riddles[currentRiddleIndex].answer,
      });
    }
  };

  const handleNextRiddle = () => {
    const nextIndex = currentRiddleIndex + 1;
    if (nextIndex < riddles.length) {
      setCurrentRiddleIndex(nextIndex);
      setShowAnswer(false);
      setBuzzedPlayer(null);

      // Rotate to next reader
      const nextReaderIndex = (currentReaderIndex + 1) % players.length;
      setCurrentReaderIndex(nextReaderIndex);

      if (pusher && players.length > 0) {
        const channel = pusher.channel(`presence-game-${gameCode}`);
        channel.trigger('client-next-riddle', {
          riddleIndex: nextIndex,
          riddle: riddles[nextIndex].clue,
          readerId: players[nextReaderIndex].id,
          readerName: players[nextReaderIndex].name,
        });
      }
    } else {
      // Game over
      if (pusher) {
        const channel = pusher.channel(`presence-game-${gameCode}`);
        channel.trigger('client-game-over', {
          finalScores: players,
        });
      }
    }
  };

  const handleAwardPoint = (playerId) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, score: p.score + 1 } : p))
    );
    setBuzzedPlayer(null);

    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      const winner = players.find((p) => p.id === playerId);
      channel.trigger('client-point-awarded', {
        playerId,
        playerName: winner?.name,
        newScore: (winner?.score || 0) + 1,
      });
    }
  };

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${gameCode}`
    : '';

  const currentRiddle = riddles[currentRiddleIndex];
  const isLastRiddle = currentRiddleIndex === riddles.length - 1;
  const buzzedPlayerData = players.find((p) => p.id === buzzedPlayer);

  return (
    <>
      <Head>
        <title>Host Game - Dirty Minds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Container maxWidth="sm">
        <Box sx={{ py: 4, minHeight: '100vh' }}>
          {!gameStarted ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                  Host Game
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                    <QRCodeSVG value={joinUrl} size={200} />
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700, mb: 1 }}>
                  Game Code: {gameCode}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                  Share this link with players:
                </Typography>

                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText(joinUrl);
                      alert('Link copied! Share it with your players.');
                    }}
                  >
                    Copy Join Link
                  </Button>

                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<ShareIcon />}
                      onClick={() => {
                        navigator.share({
                          title: 'Join Dirty Minds Game',
                          text: `Join my game with code: ${gameCode}`,
                          url: joinUrl,
                        });
                      }}
                    >
                      Share via Text/Email
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Players ({players.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {players.length === 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Waiting for players...
                      </Typography>
                    )}
                    {players.map((player) => (
                      <Chip
                        key={player.id}
                        label={player.name}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleStartGame}
                  disabled={players.length < 1}
                  startIcon={<PlayArrowIcon />}
                >
                  Start Game
                </Button>

                {players.length < 1 && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                    Waiting for at least 1 player to join
                  </Typography>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box>
              <Scoreboard players={players} />

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Riddle {currentRiddleIndex + 1} of {riddles.length}
                    </Typography>
                    <Chip
                      label={showAnswer ? 'Answer Revealed' : 'In Progress'}
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

                  {buzzedPlayerData && !showAnswer && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(255, 92, 147, 0.2)',
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {buzzedPlayerData.name} buzzed in first!
                      </Typography>
                    </Box>
                  )}

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
                        onClick={handleRevealAnswer}
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
                              onClick={() => handleAwardPoint(player.id)}
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
                          onClick={handleNextRiddle}
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
          )}
        </Box>
      </Container>
    </>
  );
}
