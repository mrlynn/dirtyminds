import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import PusherClient from 'pusher-js';
import SendIcon from '@mui/icons-material/Send';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { playSound } from '../utils/sounds';
import Celebration from '../components/Celebration';

export default function JoinGame() {
  const router = useRouter();
  const { code: urlCode } = router.query;

  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => nanoid());
  const [hasJoined, setHasJoined] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [myScore, setMyScore] = useState(0);

  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRiddle, setCurrentRiddle] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [myAnswer, setMyAnswer] = useState('');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  const [allAnswers, setAllAnswers] = useState([]);
  const [myCorrectVote, setMyCorrectVote] = useState(null);
  const [myFunniestVote, setMyFunniestVote] = useState(null);

  const [pusher, setPusher] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    if (urlCode) {
      setGameCode(urlCode.toUpperCase());
    }
  }, [urlCode]);

  const handleJoinGame = async () => {
    if (!gameCode || !playerName) {
      alert('Please enter game code and your name');
      return;
    }

    const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
      auth: {
        params: {
          user_id: playerId,
          user_info: JSON.stringify({ name: playerName }),
        },
      },
    });

    setPusher(pusherClient);

    try {
      const channel = pusherClient.subscribe(`presence-game-${gameCode}`);

      channel.bind('pusher:subscription_succeeded', () => {
        setHasJoined(true);
        playSound('join');
      });

      channel.bind('pusher:subscription_error', () => {
        alert('Could not join game. Check the code and try again.');
      });

      // Role assignment
      channel.bind('client-role-assigned', (data) => {
        if (data.playerId === playerId) {
          setPlayerRole(data.role);
          playSound(data.role === 'SAINT' ? 'saint' : 'sinner');
        }
      });

      // Game started
      channel.bind('client-game-started', (data) => {
        setGamePhase(data.gamePhase);
        setCurrentRiddle(data.riddle);
      });

      // Phase changes
      channel.bind('client-phase-change', (data) => {
        console.log('Phase change:', data);
        setGamePhase(data.phase);

        if (data.phase === 'riddle-display') {
          setCurrentRiddle(data.riddle);
          setMyAnswer('');
          setHasSubmittedAnswer(false);
          setMyCorrectVote(null);
          setMyFunniestVote(null);
          setAllAnswers([]);
        }

        if (data.phase === 'answering') {
          setCurrentRiddle(data.riddle);
        }

        if (data.phase === 'reveal-correct') {
          setCorrectAnswer(data.correctAnswer);
        }

        if (data.phase === 'reveal-answers') {
          setAllAnswers(data.answers);
        }
      });

      // Results
      channel.bind('client-results', (data) => {
        setGamePhase(data.phase);

        // Update my score
        const me = data.players.find((p) => p.id === playerId);
        if (me) {
          const scoreGained = me.score - myScore;
          setMyScore(me.score);

          if (scoreGained > 0) {
            // I won something!
            if (data.correctWinner && data.correctWinner.id === playerId) {
              setCelebrationMessage('Most Correct! +' + scoreGained);
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 3000);
            } else if (data.funniestWinner && data.funniestWinner.id === playerId) {
              setCelebrationMessage('Funniest! +' + scoreGained);
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 3000);
            }
          }
        }
      });

      // Game over
      channel.bind('client-game-over', (data) => {
        setGamePhase('game-over');
        const me = data.finalScores.find((p) => p.id === playerId);
        if (me) {
          setMyScore(me.score);
        }
      });
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game');
    }
  };

  const handleSubmitAnswer = () => {
    if (!myAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-answer-submitted', {
        playerId,
        playerName,
        role: playerRole,
        answer: myAnswer,
      });

      setHasSubmittedAnswer(true);
      playSound('click');
    }
  };

  const handleVote = (voteType, answerId) => {
    if (!pusher) return;

    const channel = pusher.channel(`presence-game-${gameCode}`);
    channel.trigger('client-vote-cast', {
      voterId: playerId,
      voteType,
      answerId,
    });

    if (voteType === 'correct') {
      setMyCorrectVote(answerId);
    } else {
      setMyFunniestVote(answerId);
    }

    playSound('vote');
  };

  const getRoleInfo = () => {
    if (playerRole === 'SAINT') {
      return {
        icon: '😇',
        label: 'Saint',
        color: 'primary',
        description: 'Submit the MOST CORRECT answer',
      };
    } else if (playerRole === 'SINNER') {
      return {
        icon: '😈',
        label: 'Sinner',
        color: 'secondary',
        description: 'Submit the FUNNIEST/DIRTIEST answer',
      };
    }
    return null;
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      <Head>
        <title>Join Game - Dirty Minds</title>
      </Head>

      <Container maxWidth="sm">
        <Box sx={{ py: 4, minHeight: '100vh' }}>
          {/* Join Form */}
          {!hasJoined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                    Join Game
                  </Typography>

                  <Stack spacing={2} sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      label="Game Code"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      inputProps={{ maxLength: 6 }}
                    />

                    <TextField
                      fullWidth
                      label="Your Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleJoinGame}
                      disabled={!gameCode || !playerName}
                      sx={{ py: 2 }}
                    >
                      Join Game
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game Screen */}
          {hasJoined && (
            <Box>
              {/* Header with Role & Score */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {playerName}
                      </Typography>
                      {roleInfo && (
                        <Chip
                          icon={<span>{roleInfo.icon}</span>}
                          label={roleInfo.label}
                          color={roleInfo.color}
                          size="small"
                        />
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {myScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        points
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Main Game Area */}
              <Card>
                <CardContent>
                  {/* Waiting for Game */}
                  {gamePhase === 'waiting' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h5" gutterBottom>
                          Waiting for game to start...
                        </Typography>
                        {roleInfo && (
                          <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {roleInfo.icon} You are a {roleInfo.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {roleInfo.description}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </motion.div>
                  )}

                  {/* Riddle Display */}
                  {gamePhase === 'riddle-display' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                          Get Ready!
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          Next riddle starting...
                        </Typography>
                      </Box>
                    </motion.div>
                  )}

                  {/* Answering Phase */}
                  {gamePhase === 'answering' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                          {currentRiddle}
                        </Typography>
                        {roleInfo && (
                          <Chip
                            label={roleInfo.description}
                            color={roleInfo.color}
                            size="small"
                          />
                        )}
                      </Box>

                      {!hasSubmittedAnswer ? (
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Your Answer"
                            value={myAnswer}
                            onChange={(e) => setMyAnswer(e.target.value)}
                            placeholder={
                              playerRole === 'SAINT'
                                ? 'Enter the correct answer...'
                                : 'Enter a funny/filthy-sounding answer...'
                            }
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<SendIcon />}
                            onClick={handleSubmitAnswer}
                            disabled={!myAnswer.trim()}
                            sx={{ py: 2 }}
                          >
                            Submit Answer
                          </Button>
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="h6" color="primary.main" gutterBottom>
                            ✓ Answer Submitted!
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Waiting for other players...
                          </Typography>
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{myAnswer}"
                            </Typography>
                          </Box>
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
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom color="text.secondary">
                          Correct Answer:
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {correctAnswer}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}

                  {/* Reveal Answers */}
                  {gamePhase === 'reveal-answers' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Player Answers:
                      </Typography>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {allAnswers.map((answer, index) => (
                          <motion.div
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                bgcolor:
                                  answer.id === playerId
                                    ? 'rgba(0, 237, 100, 0.1)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                border:
                                  answer.id === playerId
                                    ? '2px solid rgba(0, 237, 100, 0.5)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Typography variant="body1">{answer.answer}</Typography>
                              {answer.id === playerId && (
                                <Chip label="Your Answer" size="small" color="primary" sx={{ mt: 1 }} />
                              )}
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        Voting will start soon...
                      </Typography>
                    </motion.div>
                  )}

                  {/* Voting Phase */}
                  {gamePhase === 'voting' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Vote for the Best Answers!
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        Vote in both categories (you can't vote for your own answer)
                      </Typography>

                      <Stack spacing={2}>
                        {allAnswers.map((answer, index) => {
                          const isMyAnswer = answer.id === playerId;

                          return (
                            <Box
                              key={index}
                              sx={{
                                p: 2,
                                bgcolor: isMyAnswer
                                  ? 'rgba(0, 237, 100, 0.1)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                border: isMyAnswer
                                  ? '2px solid rgba(0, 237, 100, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {answer.answer}
                              </Typography>

                              {!isMyAnswer && (
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    fullWidth
                                    variant={myCorrectVote === answer.id ? 'contained' : 'outlined'}
                                    color="primary"
                                    size="small"
                                    startIcon={<HowToVoteIcon />}
                                    onClick={() => handleVote('correct', answer.id)}
                                    disabled={myCorrectVote !== null && myCorrectVote !== answer.id}
                                  >
                                    Most Correct
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant={myFunniestVote === answer.id ? 'contained' : 'outlined'}
                                    color="secondary"
                                    size="small"
                                    startIcon={<HowToVoteIcon />}
                                    onClick={() => handleVote('funniest', answer.id)}
                                    disabled={myFunniestVote !== null && myFunniestVote !== answer.id}
                                  >
                                    Funniest
                                  </Button>
                                </Stack>
                              )}

                              {isMyAnswer && (
                                <Chip label="Your Answer (Can't Vote)" size="small" color="primary" />
                              )}
                            </Box>
                          );
                        })}
                      </Stack>

                      {myCorrectVote && myFunniestVote && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 237, 100, 0.1)', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            ✓ Votes Submitted! Waiting for others...
                          </Typography>
                        </Box>
                      )}
                    </motion.div>
                  )}

                  {/* Results Phase */}
                  {gamePhase === 'results' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                          Round Complete!
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {myScore} points
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Next round starting soon...
                        </Typography>
                      </Box>
                    </motion.div>
                  )}

                  {/* Game Over */}
                  {gamePhase === 'game-over' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                          Game Over!
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', my: 3 }}>
                          {myScore}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          Final Score
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={() => router.push('/')}
                          sx={{ mt: 4 }}
                        >
                          Play Again
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
            {showCelebration && (
              <Celebration
                trigger={true}
                message={celebrationMessage}
                type={playerRole === 'SAINT' ? 'saint' : 'sinner'}
                duration={3000}
              />
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </>
  );
}
