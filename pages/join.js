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
import PusherClient from 'pusher-js';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
  const [isMyTurnToRead, setIsMyTurnToRead] = useState(false);
  const [currentReaderName, setCurrentReaderName] = useState('');
  const [playerRole, setPlayerRole] = useState(null); // 'SAINT' or 'SINNER'
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'answering', 'reveal', 'voting', 'scores'
  const [myAnswer, setMyAnswer] = useState('');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);
  const [myCorrectVote, setMyCorrectVote] = useState(null);
  const [myFunniestVote, setMyFunniestVote] = useState(null);
  const [answerCount, setAnswerCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (code) {
      setGameCode(code.toUpperCase());
    }
  }, [code]);

  const handleJoinGame = () => {
    if (!gameCode || !playerName) {
      alert('Please enter your name and game code');
      return;
    }

    console.log('Attempting to join game:', gameCode, 'as', playerName);

    try {
      // Create Pusher client with auth params
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

      console.log('Pusher client created');

      setPusher(pusherClient);

      const channel = pusherClient.subscribe(`presence-game-${gameCode}`);
      console.log('Subscribing to channel:', `presence-game-${gameCode}`);

      // Authenticate with player info
      channel.bind('pusher:subscription_succeeded', (members) => {
        console.log('Successfully joined game!', members);
        setJoined(true);
      });

      // Listen for role assignment
      channel.bind('client-role-assigned', (data) => {
        if (data.playerId === playerId) {
          console.log('Role assigned:', data.role);
          setPlayerRole(data.role);
        }
      });

      channel.bind('pusher:subscription_error', (error) => {
        console.error('Pusher subscription error:', error);
        alert('Could not join game. Check the game code or try again.');
      });

      // Listen for game events
      channel.bind('client-game-started', (data) => {
        setGameStarted(true);
        setTotalRiddles(data.riddleCount);
        setRiddleNumber(1);
        setCurrentRiddle(data.firstRiddle);
        setCanBuzzIn(true);
        setIsMyTurnToRead(data.readerId === playerId);
        setCurrentReaderName(data.readerName);
        setGamePhase(data.gamePhase || 'answering');
        setHasSubmittedAnswer(false);
        setMyAnswer('');
      });

      channel.bind('client-next-riddle', (data) => {
        setCurrentRiddle(data.riddle);
        setRiddleNumber(data.riddleIndex + 1);
        setCanBuzzIn(true);
        setBuzzedIn(false);
        setBuzzResult(null);
        setAnswer('');
        setIsMyTurnToRead(data.readerId === playerId);
        setCurrentReaderName(data.readerName);
        setGamePhase(data.gamePhase || 'answering');
        setHasSubmittedAnswer(false);
        setMyAnswer('');
        setAllAnswers([]);
        setMyCorrectVote(null);
        setMyFunniestVote(null);
        setAnswerCount(0);
      });

    channel.bind('client-buzz-result', (data) => {
      if (data.winner === playerId) {
        setBuzzResult('winner');
      } else {
        setBuzzResult('too-late');
      }
      setCanBuzzIn(false);
    });

    channel.bind('client-answer-count-update', (data) => {
      setAnswerCount(data.count);
      setTotalPlayers(data.total);
    });

    channel.bind('client-answers-locked', (data) => {
      setGamePhase(data.gamePhase || 'reveal');
    });

    channel.bind('client-reveal-answer', (data) => {
      setAnswer(data.answer);
      setGamePhase(data.gamePhase || 'voting');
      setAllAnswers(data.submittedAnswers || []);
    });

    channel.bind('client-scores-updated', (data) => {
      setGamePhase(data.gamePhase || 'scores');
      const myPlayer = data.players.find((p) => p.id === playerId);
      if (myPlayer) {
        setMyScore(myPlayer.score);
      }
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
    } catch (error) {
      console.error('Error creating Pusher client:', error);
      alert('Failed to connect. Please try again.');
    }
  };

  const playBuzzerSound = () => {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator for buzzer sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure buzzer sound (lower frequency for a classic buzzer)
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime); // 200Hz buzzer

    // Envelope for the buzz
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleBuzzIn = () => {
    if (!canBuzzIn || buzzedIn) return;

    // Play buzzer sound
    playBuzzerSound();

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

  const handleSubmitAnswer = () => {
    if (!myAnswer.trim() || hasSubmittedAnswer) return;

    setHasSubmittedAnswer(true);

    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-answer-submitted', {
        playerId,
        playerName,
        role: playerRole,
        answer: myAnswer.trim(),
      });
    }
  };

  const handleVote = (voteType, answerId) => {
    if (pusher) {
      const channel = pusher.channel(`presence-game-${gameCode}`);
      channel.trigger('client-vote-cast', {
        voterId: playerId,
        voteType, // 'correct' or 'funniest'
        answerId,
      });

      if (voteType === 'correct') {
        setMyCorrectVote(answerId);
      } else if (voteType === 'funniest') {
        setMyFunniestVote(answerId);
      }
    }
  };

  // Game Master Controls (only active player whose turn it is to read)
  const handleGMLockAnswers = () => {
    if (!isMyTurnToRead || !pusher) return;

    const channel = pusher.channel(`presence-game-${gameCode}`);
    channel.trigger('client-gm-lock-answers', {
      gameMasterId: playerId,
      gameMasterName: playerName,
    });
  };

  const handleGMRevealAnswer = () => {
    if (!isMyTurnToRead || !pusher) return;

    const channel = pusher.channel(`presence-game-${gameCode}`);
    channel.trigger('client-gm-reveal-answer', {
      gameMasterId: playerId,
      gameMasterName: playerName,
    });
  };

  const handleGMFinishVoting = () => {
    if (!isMyTurnToRead || !pusher) return;

    const channel = pusher.channel(`presence-game-${gameCode}`);
    channel.trigger('client-gm-finish-voting', {
      gameMasterId: playerId,
      gameMasterName: playerName,
    });
  };

  const handleGMNextRiddle = () => {
    if (!isMyTurnToRead || !pusher) return;

    const channel = pusher.channel(`presence-game-${gameCode}`);
    channel.trigger('client-gm-next-riddle', {
      gameMasterId: playerId,
      gameMasterName: playerName,
    });
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

                {playerRole && (
                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: playerRole === 'SAINT' ? 'rgba(0, 237, 100, 0.2)' : 'rgba(255, 92, 147, 0.2)',
                      border: '2px solid',
                      borderColor: playerRole === 'SAINT' ? 'primary.main' : 'secondary.main',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: playerRole === 'SAINT' ? 'primary.main' : 'secondary.main' }}>
                      {playerRole === 'SAINT' ? '😇 You are a SAINT' : '😈 You are a SINNER'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                      {playerRole === 'SAINT'
                        ? 'Your goal: Submit the most CORRECT answer'
                        : 'Your goal: Submit the most FILTHY-SOUNDING (but safe) answer'}
                    </Typography>
                  </Box>
                )}

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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Riddle {riddleNumber} of {totalRiddles}
                    </Typography>
                    <Chip
                      label={gamePhase === 'answering' ? 'Answering' : gamePhase === 'reveal' ? 'Locked' : gamePhase === 'voting' ? 'Voting' : 'Scores'}
                      color={gamePhase === 'voting' ? 'secondary' : gamePhase === 'scores' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Stack>

                  {/* Show whose turn it is to read */}
                  {isMyTurnToRead ? (
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'rgba(0, 237, 100, 0.2)',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        🎮 You're the Game Master!
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Read this riddle out loud to the group
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        You'll control the reveal & voting phases
                      </Typography>
                    </Box>
                  ) : currentReaderName && (
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        🎮 {currentReaderName} is the Game Master
                      </Typography>
                    </Box>
                  )}

                  {/* Display the current riddle */}
                  {currentRiddle && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        minHeight: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                        {currentRiddle}
                      </Typography>
                    </Box>
                  )}

                  {/* Role Badge */}
                  {playerRole && (
                    <Chip
                      label={playerRole === 'SAINT' ? '😇 Saint' : '😈 Sinner'}
                      color={playerRole === 'SAINT' ? 'primary' : 'secondary'}
                      sx={{ mb: 2, fontWeight: 700 }}
                    />
                  )}

                  {/* ANSWERING PHASE */}
                  {gamePhase === 'answering' && !hasSubmittedAnswer && !isMyTurnToRead && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                        {playerRole === 'SAINT'
                          ? '😇 Submit your CLEAN/INNOCENT guess:'
                          : '😈 Submit your FILTHY-SOUNDING (but safe) guess:'}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        placeholder={playerRole === 'SAINT'
                          ? 'Enter your clean, innocent answer...'
                          : 'Enter your filthiest-sounding (clean) guess...'}
                        value={myAnswer}
                        onChange={(e) => setMyAnswer(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color={playerRole === 'SAINT' ? 'primary' : 'secondary'}
                        size="large"
                        onClick={handleSubmitAnswer}
                        disabled={!myAnswer.trim()}
                        sx={{ py: 2, fontWeight: 700 }}
                      >
                        Submit Answer
                      </Button>
                    </Box>
                  )}

                  {/* GAME MASTER: Answer submission tracking */}
                  {gamePhase === 'answering' && isMyTurnToRead && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 3,
                          mb: 2,
                          bgcolor: 'rgba(0, 237, 100, 0.1)',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: 2,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          Answers: {answerCount} / {totalPlayers - 1}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          (You don't submit - you're the Game Master!)
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleGMLockAnswers}
                        disabled={answerCount === 0}
                        sx={{ py: 2, fontWeight: 700 }}
                      >
                        Lock Answers ({answerCount} received)
                      </Button>
                    </Box>
                  )}

                  {gamePhase === 'answering' && hasSubmittedAnswer && (
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
                        Answer Submitted!
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Waiting for other players...
                      </Typography>
                    </Box>
                  )}

                  {/* REVEAL PHASE */}
                  {gamePhase === 'reveal' && !isMyTurnToRead && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Answers are locked! Waiting for Game Master to reveal...
                      </Typography>
                    </Box>
                  )}

                  {/* GAME MASTER: Reveal button */}
                  {gamePhase === 'reveal' && isMyTurnToRead && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 3,
                          mb: 2,
                          bgcolor: 'rgba(0, 237, 100, 0.1)',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: 2,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          All answers are locked!
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Ready to reveal the answer and start voting?
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleGMRevealAnswer}
                        startIcon={<VisibilityIcon />}
                        sx={{ py: 2, fontWeight: 700 }}
                      >
                        Reveal Answer & Start Voting
                      </Button>
                    </Box>
                  )}

                  {/* VOTING PHASE */}
                  {gamePhase === 'voting' && (
                    <Box sx={{ mb: 3 }}>
                      {answer && (
                        <Box
                          sx={{
                            p: 3,
                            mb: 3,
                            bgcolor: 'rgba(0, 237, 100, 0.1)',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase' }}>
                            Correct Answer
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                            {answer}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        All Answers:
                      </Typography>

                      {allAnswers.map((ans, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            border: ans.playerId === playerId ? '2px solid' : 'none',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {ans.answer}
                          </Typography>
                          {!isMyTurnToRead && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant={myCorrectVote === ans.playerId ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => handleVote('correct', ans.playerId)}
                                disabled={ans.playerId === playerId}
                              >
                                Most Correct
                              </Button>
                              <Button
                                size="small"
                                variant={myFunniestVote === ans.playerId ? 'contained' : 'outlined'}
                                color="secondary"
                                onClick={() => handleVote('funniest', ans.playerId)}
                                disabled={ans.playerId === playerId}
                              >
                                Funniest/Filthiest
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      ))}

                      {/* GAME MASTER: Finish Voting button */}
                      {isMyTurnToRead && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 2, color: 'text.secondary' }}>
                            You're the Game Master - wait for others to vote
                          </Typography>
                          <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={handleGMFinishVoting}
                            sx={{ py: 2, fontWeight: 700 }}
                          >
                            Finish Voting & Calculate Scores
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* SCORES PHASE */}
                  {gamePhase === 'scores' && !isMyTurnToRead && (
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Round Complete!
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Waiting for Game Master to continue...
                      </Typography>
                    </Box>
                  )}

                  {/* GAME MASTER: Next Riddle button */}
                  {gamePhase === 'scores' && isMyTurnToRead && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 3,
                          mb: 2,
                          bgcolor: 'rgba(0, 237, 100, 0.1)',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: 2,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Round Complete!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Scores have been updated. Ready for the next riddle?
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleGMNextRiddle}
                        endIcon={<NavigateNextIcon />}
                        sx={{ py: 2, fontWeight: 700 }}
                      >
                        Next Riddle
                      </Button>
                    </Box>
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
