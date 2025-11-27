import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Card, CardContent, Typography, Button, Stack, Chip, LinearProgress } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import PusherClient from 'pusher-js';
import riddlesData from '../data/riddles';
import Scoreboard from '../components/Scoreboard';
import Timer from '../components/Timer';
import Celebration from '../components/Celebration';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { playSound } from '../utils/sounds';

export default function HostGame() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [hostId] = useState(() => nanoid());
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [riddles, setRiddles] = useState([]);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [pusher, setPusher] = useState(null);

  // Game phases: 'lobby' | 'riddle-display' | 'answering' | 'reveal-correct' | 'reveal-answers' | 'voting' | 'results'
  const [gamePhase, setGamePhase] = useState('lobby');

  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [votes, setVotes] = useState({ correct: {}, funniest: {} });
  const [canShare, setCanShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // Timer refs
  const phaseTimerRef = useRef(null);

  const channelRef = useRef(null);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  useEffect(() => {
    const createGame = async () => {
      const code = nanoid(6).toUpperCase();
      setGameCode(code);

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
      channelRef.current = channel;

      // Listen for player joins
      channel.bind('pusher:member_added', (member) => {
        setPlayers((prev) => {
          if (prev.find((p) => p.id === member.id)) return prev;

          const role = Math.random() < 0.5 ? 'SAINT' : 'SINNER';
          const newPlayer = {
            id: member.id,
            name: member.info.name,
            score: 0,
            role: role,
          };

          // Notify player of their role
          channel.trigger('client-role-assigned', {
            playerId: member.id,
            role: role,
          });

          playSound('join');
          return [...prev, newPlayer];
        });
      });

      // Listen for player leaves
      channel.bind('pusher:member_removed', (member) => {
        setPlayers((prev) => prev.filter((p) => p.id !== member.id));
      });

      // Listen for answer submissions
      channel.bind('client-answer-submitted', (data) => {
        setSubmittedAnswers((prev) => {
          if (prev.find((a) => a.playerId === data.playerId)) return prev;
          const newAnswers = [...prev, data];

          // Broadcast count update
          channel.trigger('client-answer-count-update', {
            count: newAnswers.length,
            total: players.length,
          });

          return newAnswers;
        });
      });

      // Listen for votes
      channel.bind('client-vote-cast', (data) => {
        setVotes((currentVotes) => {
          const updated = { ...currentVotes };

          if (data.voteType === 'correct') {
            updated.correct = { ...updated.correct, [data.voterId]: data.answerId };
          } else if (data.voteType === 'funniest') {
            updated.funniest = { ...updated.funniest, [data.voterId]: data.answerId };
          }

          return updated;
        });
      });
    };

    createGame();

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, []);

  // Auto-progress through phases
  const progressToNextPhase = () => {
    const channel = channelRef.current;
    if (!channel) {
      console.log('No channel available, cannot progress');
      return;
    }

    setGamePhase((currentPhase) => {
      console.log('progressToNextPhase - current phase:', currentPhase);

      // Clear any existing timer
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }

      switch (currentPhase) {
        case 'riddle-display':
          // Move to answering
          console.log('Moving to answering phase');
          channel.trigger('client-phase-change', {
            phase: 'answering',
            riddle: riddles[currentRiddleIndex].clue,
          });

          // Auto-progress after 60 seconds (or when all answers in)
          phaseTimerRef.current = setTimeout(() => {
            console.log('60s timer expired, checking if all answers submitted');
            progressToNextPhase();
          }, 60000);

          return 'answering';

        case 'answering':
          // Move to reveal correct answer
          console.log('Moving to reveal-correct phase');
          channel.trigger('client-phase-change', {
            phase: 'reveal-correct',
            correctAnswer: riddles[currentRiddleIndex].answer,
          });
          playSound('correct');

          // Auto-progress after 5 seconds
          phaseTimerRef.current = setTimeout(() => {
            console.log('5s timer expired, progressing from reveal-correct');
            progressToNextPhase();
          }, 5000);

          return 'reveal-correct';

        case 'reveal-correct':
          // Move to reveal answers
          console.log('Moving to reveal-answers phase');

          // Shuffle answers for anonymity
          const shuffledAnswers = [...submittedAnswers].sort(() => Math.random() - 0.5);

          channel.trigger('client-phase-change', {
            phase: 'reveal-answers',
            answers: shuffledAnswers.map(a => ({ id: a.playerId, answer: a.answer })),
          });

          // Auto-progress after 3s per answer + 2s buffer
          const revealDuration = shuffledAnswers.length * 3000 + 2000;
          console.log(`Reveal duration: ${revealDuration}ms for ${shuffledAnswers.length} answers`);
          phaseTimerRef.current = setTimeout(() => {
            console.log('Reveal timer expired, progressing to voting');
            progressToNextPhase();
          }, revealDuration);

          return 'reveal-answers';

        case 'reveal-answers':
          // Move to voting
          console.log('Moving to voting phase');
          channel.trigger('client-phase-change', {
            phase: 'voting',
          });

          // Auto-progress after 30 seconds
          phaseTimerRef.current = setTimeout(() => {
            console.log('30s voting timer expired, calculating results');
            // Don't call progressToNextPhase, call calculateResults directly
            setGamePhase('results');
            calculateResults();
          }, 30000);

          return 'voting';

        case 'voting':
          // This case is triggered by calculateResults()
          console.log('Moving to results phase');
          return 'results';

        case 'results':
          // This case is triggered by moveToNextRiddle()
          console.log('Results phase - waiting for next riddle');
          return 'results';

        default:
          console.log('Unknown phase:', currentPhase);
          return currentPhase;
      }
    });
  };

  const calculateResults = () => {
    const channel = channelRef.current;
    if (!channel) return;

    console.log('Calculating results with votes:', votes);

    // Count votes
    const correctVotes = {};
    const funniestVotes = {};

    Object.values(votes.correct).forEach((answerId) => {
      correctVotes[answerId] = (correctVotes[answerId] || 0) + 1;
    });

    Object.values(votes.funniest).forEach((answerId) => {
      funniestVotes[answerId] = (funniestVotes[answerId] || 0) + 1;
    });

    console.log('Vote counts:', { correctVotes, funniestVotes });

    // Find winners
    let correctWinnerId = null;
    let funniestWinnerId = null;

    if (Object.keys(correctVotes).length > 0) {
      correctWinnerId = Object.keys(correctVotes).reduce((a, b) =>
        correctVotes[a] > correctVotes[b] ? a : b
      );
    }

    if (Object.keys(funniestVotes).length > 0) {
      funniestWinnerId = Object.keys(funniestVotes).reduce((a, b) =>
        funniestVotes[a] > funniestVotes[b] ? a : b
      );
    }

    console.log('Winners:', { correctWinnerId, funniestWinnerId });

    // Award points
    const updatedPlayers = players.map((p) => {
      let newScore = p.score;
      let wonCorrect = false;
      let wonFunniest = false;

      if (p.role === 'SAINT' && p.id === correctWinnerId) {
        newScore += 1;
        wonCorrect = true;
        console.log(`${p.name} (SAINT) wins Most Correct (+1)`);
      }

      if (p.role === 'SINNER' && p.id === funniestWinnerId) {
        newScore += 1;
        wonFunniest = true;
        console.log(`${p.name} (SINNER) wins Funniest (+1)`);
      }

      // Bonus for winning both
      if (p.role === 'SINNER' && p.id === correctWinnerId && p.id === funniestWinnerId) {
        newScore += 1;
        console.log(`${p.name} (SINNER) BONUS for winning both (+1)`);
      }

      return { ...p, score: newScore, wonCorrect, wonFunniest };
    });

    console.log('Updated players:', updatedPlayers);

    setPlayers(updatedPlayers);
    setGamePhase('results');

    // Find winners for celebration
    const correctWinner = updatedPlayers.find(p => p.id === correctWinnerId);
    const funniestWinner = updatedPlayers.find(p => p.id === funniestWinnerId);

    // Broadcast results
    channel.trigger('client-results', {
      phase: 'results',
      players: updatedPlayers,
      correctWinner: correctWinner ? { id: correctWinner.id, name: correctWinner.name } : null,
      funniestWinner: funniestWinner ? { id: funniestWinner.id, name: funniestWinner.name } : null,
    });

    // Show celebration
    if (correctWinner || funniestWinner) {
      playSound('roundComplete');
      setShowCelebration(true);
      setCelebrationData({
        correctWinner: correctWinner?.name,
        funniestWinner: funniestWinner?.name,
      });

      setTimeout(() => setShowCelebration(false), 4000);
    }

    // Auto-progress after 10 seconds
    phaseTimerRef.current = setTimeout(() => {
      progressToNextPhase();
    }, 10000);
  };

  const moveToNextRiddle = () => {
    const channel = channelRef.current;
    if (!channel) return;

    const nextIndex = currentRiddleIndex + 1;

    if (nextIndex < riddles.length) {
      setCurrentRiddleIndex(nextIndex);
      setGamePhase('riddle-display');
      setSubmittedAnswers([]);
      setVotes({ correct: {}, funniest: {} });

      channel.trigger('client-phase-change', {
        phase: 'riddle-display',
        riddleIndex: nextIndex,
        riddle: riddles[nextIndex].clue,
      });

      // Auto-progress after 5 seconds
      phaseTimerRef.current = setTimeout(() => {
        progressToNextPhase();
      }, 5000);
    } else {
      // Game over
      setGamePhase('game-over');
      channel.trigger('client-game-over', {
        finalScores: players,
      });
    }
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      alert('Need at least 1 player to start!');
      return;
    }

    // Select 10 random riddles
    const shuffled = [...riddlesData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    setRiddles(selected);
    setGameStarted(true);
    setGamePhase('riddle-display');
    playSound('start');

    const channel = channelRef.current;
    if (channel) {
      channel.trigger('client-game-started', {
        riddleIndex: 0,
        riddle: selected[0].clue,
        gamePhase: 'riddle-display',
      });
    }

    // Auto-progress after 5 seconds
    phaseTimerRef.current = setTimeout(() => {
      progressToNextPhase();
    }, 5000);
  };

  const handleSkipPhase = () => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
    progressToNextPhase();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    playSound('click');
    alert('Game code copied!');
  };

  const handleShare = async () => {
    const joinUrl = `${window.location.origin}/join?code=${gameCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Dirty Minds!',
          text: `Join my Dirty Minds game with code: ${gameCode}`,
          url: joinUrl,
        });
        playSound('click');
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const currentRiddle = riddles[currentRiddleIndex];

  return (
    <>
      <Head>
        <title>Host Game - Dirty Minds</title>
      </Head>

      <Container maxWidth="lg">
        <Box sx={{ py: 3, minHeight: '100vh' }}>
          {/* Lobby Phase */}
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Game Code: {gameCode}
                  </Typography>

                  <Box sx={{ my: 3, textAlign: 'center' }}>
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${gameCode}`}
                      size={200}
                      level="H"
                    />
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyCode}
                    >
                      Copy Code
                    </Button>
                    {canShare && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        onClick={handleShare}
                      >
                        Share
                      </Button>
                    )}
                  </Stack>

                  <Typography variant="h6" gutterBottom>
                    Players ({players.length})
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {players.map((player) => (
                      <Chip
                        key={player.id}
                        label={`${player.role === 'SAINT' ? '😇' : '😈'} ${player.name}`}
                        color={player.role === 'SAINT' ? 'primary' : 'secondary'}
                      />
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartGame}
                    disabled={players.length === 0}
                    sx={{ py: 2 }}
                  >
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game Started */}
          {gameStarted && currentRiddle && (
            <Box>
              {/* Scoreboard */}
              <Box sx={{ mb: 3 }}>
                <Scoreboard players={players} />
              </Box>

              {/* Main Game Card */}
              <Card>
                <CardContent>
                  {/* Phase Indicator */}
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Chip
                      label={gamePhase.toUpperCase().replace('-', ' ')}
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '1rem', px: 2 }}
                    />
                  </Box>

                  {/* Riddle Display */}
                  {(gamePhase === 'riddle-display' || gamePhase === 'answering') && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ mb: 3, p: 4, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                          Round {currentRiddleIndex + 1} of {riddles.length}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {currentRiddle.clue}
                        </Typography>
                      </Box>

                      {gamePhase === 'riddle-display' && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                            Get ready! Players are preparing...
                          </Typography>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SkipNextIcon />}
                            onClick={handleSkipPhase}
                            sx={{ mt: 2 }}
                          >
                            Start Answering Now
                          </Button>
                        </Box>
                      )}

                      {gamePhase === 'answering' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Answers: {submittedAnswers.length} / {players.length}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(submittedAnswers.length / players.length) * 100}
                            sx={{ mb: 2, height: 10, borderRadius: 5 }}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SkipNextIcon />}
                            onClick={handleSkipPhase}
                            disabled={submittedAnswers.length === 0}
                          >
                            Skip to Reveal ({submittedAnswers.length} answers)
                          </Button>
                        </Box>
                      )}
                    </motion.div>
                  )}

                  {/* Reveal Correct Answer */}
                  {gamePhase === 'reveal-correct' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ p: 4, bgcolor: 'rgba(0, 237, 100, 0.1)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                          Correct Answer:
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {currentRiddle.answer}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}

                  {/* Reveal Answers */}
                  {(gamePhase === 'reveal-answers' || gamePhase === 'voting') && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Player Answers:
                      </Typography>
                      <Stack spacing={2}>
                        {submittedAnswers.map((answer, index) => (
                          <motion.div
                            key={answer.playerId}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Typography variant="body1">{answer.answer}</Typography>
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>

                      {gamePhase === 'voting' && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Players are voting...
                          </Typography>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SkipNextIcon />}
                            onClick={handleSkipPhase}
                          >
                            Skip to Results
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Results */}
                  {gamePhase === 'results' && celebrationData && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                          Round Results
                        </Typography>

                        {celebrationData.correctWinner && (
                          <Box sx={{ mb: 2, p: 3, bgcolor: 'rgba(0, 237, 100, 0.1)', borderRadius: 2 }}>
                            <Typography variant="h6">
                              😇 Most Correct: {celebrationData.correctWinner} (+1)
                            </Typography>
                          </Box>
                        )}

                        {celebrationData.funniestWinner && (
                          <Box sx={{ mb: 2, p: 3, bgcolor: 'rgba(255, 92, 147, 0.1)', borderRadius: 2 }}>
                            <Typography variant="h6">
                              😈 Funniest: {celebrationData.funniestWinner} (+1)
                            </Typography>
                          </Box>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<SkipNextIcon />}
                          onClick={handleSkipPhase}
                          sx={{ mt: 2 }}
                        >
                          Next Round
                        </Button>
                      </Box>
                    </motion.div>
                  )}

                  {/* Game Over */}
                  {gamePhase === 'game-over' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                          Game Over!
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                          Final Scores
                        </Typography>
                        <Scoreboard players={players} />
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={() => router.push('/')}
                          sx={{ mt: 3 }}
                        >
                          New Game
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Celebration Overlay */}
          <AnimatePresence>
            {showCelebration && celebrationData && (
              <Celebration
                trigger={true}
                message="Round Complete!"
                type="winner"
                duration={4000}
              />
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </>
  );
}
