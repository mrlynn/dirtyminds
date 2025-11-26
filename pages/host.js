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
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'answering', 'reveal', 'voting', 'scores'
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [votes, setVotes] = useState({ correct: {}, funniest: {} });
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available (client-side only)
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

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
          // Randomly assign role: SAINT or SINNER
          const role = Math.random() < 0.5 ? 'SAINT' : 'SINNER';
          const newPlayer = {
            id: member.id,
            name: member.info.name,
            score: 0,
            role: role
          };

          // Notify the player of their assigned role
          channel.trigger('client-role-assigned', {
            playerId: member.id,
            role: role
          });

          return [...prev, newPlayer];
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

      // Listen for answer submissions
      channel.bind('client-answer-submitted', (data) => {
        setSubmittedAnswers((prev) => {
          // Avoid duplicates
          if (prev.find((a) => a.playerId === data.playerId)) return prev;
          const newAnswers = [...prev, data];

          // Broadcast answer count update to all players
          channel.trigger('client-answer-count-update', {
            count: newAnswers.length,
            total: players.length,
          });

          return newAnswers;
        });
      });

      // Listen for votes
      channel.bind('client-vote-cast', (data) => {
        setVotes((prev) => ({
          correct: {
            ...prev.correct,
            ...(data.voteType === 'correct' && { [data.voterId]: data.answerId })
          },
          funniest: {
            ...prev.funniest,
            ...(data.voteType === 'funniest' && { [data.voterId]: data.answerId })
          }
        }));
      });

      // Listen for Game Master control events (from current reader)
      channel.bind('client-gm-lock-answers', (data) => {
        console.log('Game Master locked answers:', data.gameMasterName);
        setGamePhase('reveal');
        if (pusher) {
          channel.trigger('client-answers-locked', {
            gamePhase: 'reveal',
          });
        }
      });

      channel.bind('client-gm-reveal-answer', (data) => {
        console.log('Game Master revealing answer:', data.gameMasterName);
        setShowAnswer(true);
        setGamePhase('voting');

        // Use state updaters to access current values
        setRiddles((currentRiddles) => {
          setCurrentRiddleIndex((currentIndex) => {
            setSubmittedAnswers((currentAnswers) => {
              if (pusher) {
                channel.trigger('client-reveal-answer', {
                  answer: currentRiddles[currentIndex]?.answer,
                  submittedAnswers: currentAnswers,
                  gamePhase: 'voting',
                });
              }
              return currentAnswers;
            });
            return currentIndex;
          });
          return currentRiddles;
        });
      });

      channel.bind('client-gm-finish-voting', (data) => {
        console.log('Game Master finishing voting:', data.gameMasterName);
        setGamePhase('scores');

        // Calculate winners using current state
        setVotes((currentVotes) => {
          setPlayers((currentPlayers) => {
            const correctVotes = {};
            const funniestVotes = {};

            Object.values(currentVotes.correct).forEach((answerId) => {
              correctVotes[answerId] = (correctVotes[answerId] || 0) + 1;
            });

            Object.values(currentVotes.funniest).forEach((answerId) => {
              funniestVotes[answerId] = (funniestVotes[answerId] || 0) + 1;
            });

            // Find winners
            const correctWinnerId = Object.keys(correctVotes).reduce((a, b) =>
              correctVotes[a] > correctVotes[b] ? a : b, null
            );
            const funniestWinnerId = Object.keys(funniestVotes).reduce((a, b) =>
              funniestVotes[a] > funniestVotes[b] ? a : b, null
            );

            // Award points
            const updatedPlayers = currentPlayers.map((p) => {
              let newScore = p.score;

              // Saint wins if they got most "correct" votes
              if (p.role === 'SAINT' && p.id === correctWinnerId) {
                newScore += 1;
              }

              // Sinner wins if they got most "funniest" votes
              if (p.role === 'SINNER' && p.id === funniestWinnerId) {
                newScore += 1;
              }

              // Bonus: Sinner wins both categories (fooled everyone)
              if (p.role === 'SINNER' && p.id === correctWinnerId && p.id === funniestWinnerId) {
                newScore += 1; // Extra point
              }

              return { ...p, score: newScore };
            });

            if (pusher) {
              channel.trigger('client-scores-updated', {
                players: updatedPlayers,
                correctWinnerId,
                funniestWinnerId,
                gamePhase: 'scores',
              });
            }

            return updatedPlayers;
          });

          return currentVotes;
        });
      });

      channel.bind('client-gm-next-riddle', (data) => {
        console.log('Game Master moving to next riddle:', data.gameMasterName);

        setCurrentRiddleIndex((currentIndex) => {
          const nextIndex = currentIndex + 1;

          setRiddles((currentRiddles) => {
            if (nextIndex < currentRiddles.length) {
              setShowAnswer(false);
              setBuzzedPlayer(null);
              setGamePhase('answering');
              setSubmittedAnswers([]);
              setVotes({ correct: {}, funniest: {} });

              // Rotate to next reader
              setCurrentReaderIndex((currentReaderIndex) => {
                setPlayers((currentPlayers) => {
                  const nextReaderIndex = (currentReaderIndex + 1) % currentPlayers.length;

                  if (pusher && currentPlayers.length > 0) {
                    channel.trigger('client-next-riddle', {
                      riddleIndex: nextIndex,
                      riddle: currentRiddles[nextIndex].clue,
                      readerId: currentPlayers[nextReaderIndex].id,
                      readerName: currentPlayers[nextReaderIndex].name,
                      gamePhase: 'answering',
                    });

                    // Reset answer count for new riddle
                    channel.trigger('client-answer-count-update', {
                      count: 0,
                      total: currentPlayers.length,
                    });
                  }

                  return currentPlayers;
                });

                return nextReaderIndex;
              });
            } else {
              // Game over
              if (pusher) {
                setPlayers((currentPlayers) => {
                  channel.trigger('client-game-over', {
                    finalScores: currentPlayers,
                  });
                  return currentPlayers;
                });
              }
            }

            return currentRiddles;
          });

          return nextIndex;
        });
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
    setGamePhase('answering');
    setSubmittedAnswers([]);

    // Notify all players game started with first riddle
    if (pusher && players.length > 0) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-game-started', {
        riddleCount: riddlesData.length,
        firstRiddle: shuffledRiddles[0].clue,
        readerId: players[0].id,
        readerName: players[0].name,
        gamePhase: 'answering',
      });

      // Send initial answer count
      channel.trigger('client-answer-count-update', {
        count: 0,
        total: players.length,
      });
    }
  };

  const handleLockAnswers = () => {
    setGamePhase('reveal');
    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-answers-locked', {
        gamePhase: 'reveal',
      });
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setGamePhase('voting');
    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-reveal-answer', {
        answer: riddles[currentRiddleIndex].answer,
        submittedAnswers: submittedAnswers,
        gamePhase: 'voting',
      });
    }
  };

  const handleFinishVoting = () => {
    setGamePhase('scores');

    // Calculate winners
    const correctVotes = {};
    const funniestVotes = {};

    Object.values(votes.correct).forEach((answerId) => {
      correctVotes[answerId] = (correctVotes[answerId] || 0) + 1;
    });

    Object.values(votes.funniest).forEach((answerId) => {
      funniestVotes[answerId] = (funniestVotes[answerId] || 0) + 1;
    });

    // Find winners
    const correctWinnerId = Object.keys(correctVotes).reduce((a, b) =>
      correctVotes[a] > correctVotes[b] ? a : b, null
    );
    const funniestWinnerId = Object.keys(funniestVotes).reduce((a, b) =>
      funniestVotes[a] > funniestVotes[b] ? a : b, null
    );

    // Award points
    const updatedPlayers = players.map((p) => {
      let newScore = p.score;

      // Saint wins if they got most "correct" votes
      if (p.role === 'SAINT' && p.id === correctWinnerId) {
        newScore += 1;
      }

      // Sinner wins if they got most "funniest" votes
      if (p.role === 'SINNER' && p.id === funniestWinnerId) {
        newScore += 1;
      }

      // Bonus: Sinner wins both categories (fooled everyone)
      if (p.role === 'SINNER' && p.id === correctWinnerId && p.id === funniestWinnerId) {
        newScore += 1; // Extra point
      }

      return { ...p, score: newScore };
    });

    setPlayers(updatedPlayers);

    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-scores-updated', {
        players: updatedPlayers,
        correctWinnerId,
        funniestWinnerId,
        gamePhase: 'scores',
      });
    }
  };

  const handleNextRiddle = () => {
    const nextIndex = currentRiddleIndex + 1;
    if (nextIndex < riddles.length) {
      setCurrentRiddleIndex(nextIndex);
      setShowAnswer(false);
      setBuzzedPlayer(null);
      setGamePhase('answering');
      setSubmittedAnswers([]);
      setVotes({ correct: {}, funniest: {} });

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
          gamePhase: 'answering',
        });

        // Reset answer count for new riddle
        channel.trigger('client-answer-count-update', {
          count: 0,
          total: players.length,
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

                  {canShare && (
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
                      label={gamePhase === 'answering' ? 'Answering' : gamePhase === 'reveal' ? 'Locked' : gamePhase === 'voting' ? 'Voting' : 'Scores'}
                      color={gamePhase === 'voting' ? 'secondary' : gamePhase === 'scores' ? 'primary' : 'default'}
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

                  {/* Show submitted answers count */}
                  {gamePhase === 'answering' && (
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Answers: {submittedAnswers.length} / {players.length}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {submittedAnswers.map((ans) => (
                          <Chip
                            key={ans.playerId}
                            label={ans.playerName}
                            size="small"
                            color={ans.role === 'SAINT' ? 'primary' : 'secondary'}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Submitted answers (anonymous) */}
                  {(gamePhase === 'reveal' || gamePhase === 'voting' || gamePhase === 'scores') && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        Player Answers:
                      </Typography>
                      {submittedAnswers.map((ans, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            mb: 1,
                            bgcolor: ans.role === 'SAINT' ? 'rgba(0, 237, 100, 0.1)' : 'rgba(255, 92, 147, 0.1)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body1">
                            {ans.role === 'SAINT' ? '😇' : '😈'} {ans.playerName}: "{ans.answer}"
                          </Typography>
                        </Box>
                      ))}
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
                        Correct Answer
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                        {currentRiddle.answer}
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={2}>
                    {gamePhase === 'answering' && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleLockAnswers}
                        disabled={submittedAnswers.length === 0}
                      >
                        Lock Answers ({submittedAnswers.length} received)
                      </Button>
                    )}

                    {gamePhase === 'reveal' && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleRevealAnswer}
                        startIcon={<VisibilityIcon />}
                      >
                        Reveal Answer & Start Voting
                      </Button>
                    )}

                    {gamePhase === 'voting' && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleFinishVoting}
                      >
                        Finish Voting & Calculate Scores
                      </Button>
                    )}

                    {gamePhase === 'scores' && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleNextRiddle}
                        endIcon={<NavigateNextIcon />}
                      >
                        {isLastRiddle ? 'View Final Scores' : 'Next Riddle'}
                      </Button>
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
